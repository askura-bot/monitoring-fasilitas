// app/api/osm/edit/route.ts
import { NextRequest, NextResponse } from 'next/server';

const OSM_API = `${process.env.OSM_API_URL}/api/0.6`;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function getNode(nodeId: string, token: string): Promise<string> {
  const res = await fetch(`${OSM_API}/node/${nodeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Node ${nodeId} tidak ditemukan (${res.status})`);
  return res.text();
}

function parseVersion(xml: string): string {
  const m = xml.match(/version="(\d+)"/);
  if (!m) throw new Error('Tidak dapat membaca versi node');
  return m[1];
}

function parseLatLon(xml: string): { lat: string; lon: string } {
  const lat = xml.match(/lat="([^"]+)"/)?.[1];
  const lon = xml.match(/lon="([^"]+)"/)?.[1];
  if (!lat || !lon) throw new Error('Tidak dapat membaca koordinat node');
  return { lat, lon };
}

function parseTags(xml: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const regex = /<tag k="([^"]+)" v="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    tags[m[1]] = m[2];
  }
  return tags;
}

function buildNodeXml(id: string, version: string, lat: string, lon: string, changesetId: string, tags: Record<string, string>): string {
  const tagLines = Object.entries(tags)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `    <tag k="${escapeXml(k)}" v="${escapeXml(v)}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
  <node id="${id}" version="${version}" lat="${lat}" lon="${lon}" changeset="${changesetId}">
${tagLines}
  </node>
</osm>`;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('osm_access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Belum login OSM', needLogin: true }, { status: 401 });
  }

  try {
    const { nodeId, updatedTags, comment } = await request.json();
    if (!nodeId || !updatedTags) {
      return NextResponse.json({ error: 'nodeId dan updatedTags wajib diisi' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/xml',
    };

    // 1. Fetch node existing
    const nodeXml = await getNode(nodeId, token);
    const version = parseVersion(nodeXml);
    const { lat, lon } = parseLatLon(nodeXml);
    const existingTags = parseTags(nodeXml);
    const mergedTags = { ...existingTags, ...updatedTags };

    // 2. Buat changeset
    const changesetXml = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
  <changeset>
    <tag k="created_by" v="FacilityMonitor"/>
    <tag k="comment" v="${escapeXml(comment || 'Update data fasilitas')}"/>
  </changeset>
</osm>`;

    const csRes = await fetch(`${OSM_API}/changeset/create`, {
      method: 'PUT', headers, body: changesetXml,
    });
    if (!csRes.ok) {
      const body = await csRes.text();
      throw new Error(`Gagal buat changeset: ${csRes.status} — ${body}`);
    }
    const changesetId = (await csRes.text()).trim();

    // 3. Upload node
    const updatedXml = buildNodeXml(nodeId, version, lat, lon, changesetId, mergedTags);
    const updateRes = await fetch(`${OSM_API}/node/${nodeId}`, {
      method: 'PUT', headers, body: updatedXml,
    });

    // 4. Tutup changeset (selalu)
    await fetch(`${OSM_API}/changeset/${changesetId}/close`, { method: 'PUT', headers });

    if (!updateRes.ok) {
      const body = await updateRes.text();
      throw new Error(`Gagal update node: ${updateRes.status} — ${body}`);
    }

    return NextResponse.json({
      success: true,
      nodeId,
      changesetId,
      osmUrl: `https://www.openstreetmap.org/node/${nodeId}`,
    });

  } catch (err: any) {
    console.error('OSM edit error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}