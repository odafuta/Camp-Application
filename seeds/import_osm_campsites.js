if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const OVERPASS_QUERY = `
[out:json][timeout:60];
area["ISO3166-1"="JP"][admin_level=2]->.searchArea;
(
  node["tourism"="camp_site"](area.searchArea);
  way["tourism"="camp_site"](area.searchArea);
  relation["tourism"="camp_site"](area.searchArea);
);
out center tags;
`;

const AUTHOR_ID = process.env.SEED_AUTHOR_ID;

// Wikidata 画像取得の簡易キャッシュ
const wikidataImageCache = new Map();

async function fetchWikidataImageUrl(qid) {
    if (!qid) return null;
    if (wikidataImageCache.has(qid)) return wikidataImageCache.get(qid);
    try {
        const url = `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(qid)}.json`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const entity = data && data.entities && data.entities[qid];
        const claims = entity && entity.claims;
        const p18 = claims && claims.P18 && claims.P18[0] && claims.P18[0].mainsnak && claims.P18[0].mainsnak.datavalue && claims.P18[0].mainsnak.datavalue.value;
        if (!p18) {
            wikidataImageCache.set(qid, null);
            return null;
        }
        // Wikimedia Commons の実ファイルへ解決（thumb幅は任意。原寸が欲しければパラメータ省略）
        const filePathUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p18)}?width=1200`;
        wikidataImageCache.set(qid, filePathUrl);
        return filePathUrl;
    } catch (_) {
        wikidataImageCache.set(qid, null);
        return null;
    }
}

function normalizeImageUrl(url) {
    if (!url) return null;
    // OSM の image タグはスキーム省略やスペース含みの場合があるため簡易補正
    let u = url.trim();
    if (u.startsWith('//')) u = 'https:' + u;
    return u;
}

function normalizeWebsiteUrl(url) {
    if (!url) return null;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
}

async function osmElementToCampground(el) {
    const tags = el.tags || {};
    const lon = el.lon ?? el.center?.lon;
    const lat = el.lat ?? el.center?.lat;
    if (lon == null || lat == null) return null;

    const title = tags.name || 'キャンプ場';
    const location =
        tags['addr:full'] ||
        [tags['addr:province'], tags['addr:city'], tags['addr:suburb'], tags['addr:street']]
            .filter(Boolean)
            .join(' ') ||
        tags.name ||
        '日本';

    // 価格が明示されている場合のみ設定（例: charge="1500 JPY" 等から数値抽出）
    let price;
    const charge = tags.charge || tags.fee; // fee は yes/no のこともある
    if (typeof charge === 'string') {
        const match = charge.match(/(\d[\d,\.]*)/);
        if (match) {
            const numeric = Number(match[1].replace(/[,]/g, ''));
            if (!Number.isNaN(numeric)) price = numeric;
        }
    }

    // 画像の決定: OSM image > Wikidata(P18) > なし
    const images = [];
    const osmImage = normalizeImageUrl(tags.image);
    if (osmImage) {
        images.push({ url: osmImage });
    } else if (tags.wikidata) {
        const imageUrl = await fetchWikidataImageUrl(tags.wikidata);
        if (imageUrl) images.push({ url: imageUrl });
    }

    // Webサイト: OSM website/url/official_website を優先、無ければ Wikidata の sitelink は使わない（公式とは限らないため）
    const websiteRaw = tags.website || tags.url || tags['official_website'];
    const website = normalizeWebsiteUrl(websiteRaw);

    return {
        author: AUTHOR_ID,
        location,
        title,
        description: tags.description || 'オープンデータから取り込んだキャンプ場です。',
        geometry: {
            type: 'Point',
            coordinates: [lon, lat]
        },
        ...(price !== undefined ? { price } : {}),
        ...(images.length ? { images } : {}),
        ...(website ? { website } : {})
    };
}

async function fetchOSM() {
    const res = await fetch(OVERPASS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: 'data=' + encodeURIComponent(OVERPASS_QUERY)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Overpass error: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json.elements || [];
}

(async () => {
    try {
        await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

        if (!AUTHOR_ID) {
            throw new Error('SEED_AUTHOR_ID が未設定です。既存ユーザーの _id を .env に設定してください。');
        }

        console.log('Overpass から取得中...');
        const elements = await fetchOSM();
        console.log(`取得件数: ${elements.length}`);

        const docs = [];
        for (const el of elements) {
            const doc = await osmElementToCampground(el);
            if (doc) docs.push(doc);
        }

        console.log(`保存件数: ${docs.length}`);
        if (docs.length) await Campground.insertMany(docs);

        console.log('完了');
        await mongoose.connection.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();


