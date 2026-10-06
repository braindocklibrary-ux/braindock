// Use native global fetch
const LANGUAGE_MAP = {
  'guj': 'Gujarati',
  'hin': 'Hindi',
  'san': 'Sanskrit',
  'urd': 'Urdu',
  'per': 'Persian',
  'fas': 'Persian',
  'grc': 'Ancient Greek',
  'lat': 'Latin',
  'eng': 'English',
  'en': 'English',
  'fra': 'French',
  'deu': 'German',
  'spa': 'Spanish',
  'ara': 'Arabic'
};

export const formatLanguage = (code) => {
  if (!code) return 'World Languages';
  const c = code.toLowerCase().trim();
  return LANGUAGE_MAP[c] || (c.charAt(0).toUpperCase() + c.slice(1));
};

export async function searchGlobalBooks(query, options = {}) {
  const { limit = 20, language = 'All' } = options;
  if (!query || query.trim().length === 0) return [];

  const results = [];
  const cleanQ = query.trim();

  // 1. Search Internet Archive (100% Full Unrestricted Books Only - No Sample Lock)
  const iaPromise = (async () => {
    try {
      // Strictly exclude access-restricted-item to prevent sample-locked books (jumping from page 9 to 339)
      const iaUrl = `https://archive.org/advancedsearch.php?q=(${encodeURIComponent(cleanQ)})+AND+mediatype:(texts)+AND+NOT+access-restricted-item:true&fl[]=identifier,title,creator,year,language,description,downloads,access-restricted-item&sort[]=downloads+desc&output=json&rows=20`;
      const res = await fetch(iaUrl, { timeout: 6000 });
      if (!res.ok) return [];
      const json = await res.json();
      const docs = json.response?.docs || [];

      return docs
        .filter(doc => !doc['access-restricted-item'] || doc['access-restricted-item'] === 'false')
        .map(doc => {
          const lang = formatLanguage(Array.isArray(doc.language) ? doc.language[0] : doc.language);
          const title = doc.title || 'Classical Volume';
          const author = doc.creator || 'Historical Archive';
          return {
            bookId: `IA-${doc.identifier}`,
            title: title,
            author: author,
            publicationYear: doc.year || 'Historical',
            publisher: 'Internet Archive Global Repository',
            language: lang,
            category: 'World Digital Archive',
            shelf: 'Digital Cloud Vault',
            rack: 'IA-PDF',
            rating: 4.8,
            reviewsCount: doc.downloads || 150,
            description: typeof doc.description === 'string' ? doc.description.substring(0, 300) : 'Full manuscript preserved in global digital library collection.',
            coverImage: `https://archive.org/services/img/${doc.identifier}`,
            isDigitalArchive: true,
            isGlobal: true,
            globalSource: 'Internet Archive & World Libraries',
            readOnlineUrl: `https://archive.org/details/${doc.identifier}`,
            embedReaderUrl: `https://archive.org/embed/${doc.identifier}`,
            pdfUrl: `https://archive.org/download/${doc.identifier}/${doc.identifier}.pdf`,
            hasDirectPdf: true,
            isFullUnrestricted: true
          };
        });
    } catch (err) {
      console.warn('IA search warning:', err.message);
      return [];
    }
  })();

  // 2. Search Open Library (30M+ Books Worldwide across all modern & classic subjects)
  const olPromise = (async () => {
    try {
      const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQ)}&limit=15`;
      const res = await fetch(olUrl, { timeout: 7000 });
      if (!res.ok) return [];
      const json = await res.json();
      const docs = json.docs || [];

      return docs.map(doc => {
        const lang = formatLanguage(doc.language?.[0]);
        const coverId = doc.cover_i;
        const coverImage = coverId 
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
        
        const iaId = doc.ia?.[0];
        const pdfUrl = iaId ? `https://archive.org/download/${iaId}/${iaId}.pdf` : null;

        return {
          bookId: `OL-${doc.key?.replace('/works/', '') || Math.random().toString(36).substring(7)}`,
          title: doc.title,
          author: (doc.author_name || []).slice(0, 2).join(', ') || 'Global Author',
          publicationYear: doc.first_publish_year || (doc.publish_year && doc.publish_year[0]) || 'Contemporary',
          publisher: (doc.publisher && doc.publisher[0]) || 'International Publisher',
          language: lang,
          category: (doc.subject && doc.subject[0]) || 'Global Catalog',
          shelf: 'Global Open Library',
          rack: 'OL-GLOBAL',
          isbn: (doc.isbn && doc.isbn[0]) || 'Global Edition',
          rating: 4.7,
          reviewsCount: doc.already_read_count || 110,
          description: `Part of the open global world catalog with international editions. First published in ${doc.first_publish_year || 'historical archives'}.`,
          coverImage: coverImage,
          isDigitalArchive: true,
          isGlobal: true,
          globalSource: 'Open Library World Catalog',
          readOnlineUrl: doc.key ? `https://openlibrary.org${doc.key}` : `https://openlibrary.org/search?q=${encodeURIComponent(doc.title)}`,
          embedReaderUrl: iaId ? `https://archive.org/embed/${iaId}` : null,
          pdfUrl: pdfUrl,
          hasDirectPdf: !!pdfUrl
        };
      });
    } catch (err) {
      console.warn('OL search warning:', err.message);
      return [];
    }
  })();

  const [iaBooks, olBooks] = await Promise.all([iaPromise, olPromise]);

  // Merge and deduplicate by title
  const seen = new Set();
  const merged = [];

  for (const b of [...iaBooks, ...olBooks]) {
    const key = (b.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(b);
    }
  }

  // Filter by language if specified
  if (language && language !== 'All') {
    return merged.filter(b => b.language.toLowerCase().includes(language.toLowerCase()));
  }

  return merged;
}

export async function getGlobalBookById(id) {
  if (!id) return null;

  if (id.startsWith('IA-')) {
    const identifier = id.replace('IA-', '');
    try {
      const res = await fetch(`https://archive.org/metadata/${identifier}`);
      if (!res.ok) return null;
      const json = await res.json();
      const meta = json.metadata || {};
      const files = json.files || [];
      const pdfFile = files.find(f => f.name?.toLowerCase().endsWith('.pdf'));
      const isRestricted = meta['access-restricted-item'] === 'true' || meta['access-restricted-item'] === true;

      return {
        bookId: id,
        title: meta.title || identifier,
        author: meta.creator || 'Classical Author',
        publisher: meta.publisher || 'Internet Archive & World Libraries',
        publicationYear: meta.year || meta.date || 'Historical',
        language: formatLanguage(Array.isArray(meta.language) ? meta.language[0] : meta.language),
        category: Array.isArray(meta.subject) ? meta.subject[0] : (meta.subject || 'World Digital Archive'),
        shelf: 'Digital Cloud Vault',
        rack: 'IA-GLOBAL',
        isbn: meta.identifier || 'Global Edition',
        rating: 4.8,
        reviewsCount: 220,
        description: typeof meta.description === 'string' ? meta.description : 'Rare manuscript and classical literature digitized from world archives and public collections.',
        coverImage: `https://archive.org/services/img/${identifier}`,
        isDigitalArchive: true,
        isGlobal: true,
        globalSource: 'Internet Archive Global Repository',
        readOnlineUrl: `https://archive.org/details/${identifier}`,
        embedReaderUrl: `https://archive.org/embed/${identifier}`,
        pdfUrl: pdfFile ? `https://archive.org/download/${identifier}/${pdfFile.name}` : `https://archive.org/download/${identifier}/${identifier}.pdf`,
        hasDirectPdf: true,
        isRestricted: isRestricted,
        borrowUrl: isRestricted ? `https://archive.org/details/${identifier}?borrow=1` : null
      };
    } catch (e) {
      console.error('Error fetching IA book:', e);
      return null;
    }
  }

  if (id.startsWith('OL-')) {
    const key = id.replace('OL-', '');
    try {
      const res = await fetch(`https://openlibrary.org/works/${key}.json`);
      if (!res.ok) return null;
      const work = await res.json();

      let desc = typeof work.description === 'string' ? work.description : (work.description?.value || 'Work cataloged in Open Library global database.');

      const coverId = work.covers?.[0];
      const coverImage = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';

      return {
        bookId: id,
        title: work.title || 'World Title',
        author: 'Global Literary Collection',
        publisher: 'International Publishers',
        publicationYear: work.created?.value ? work.created.value.substring(0, 4) : 'Cataloged',
        language: 'World Literature',
        category: (work.subjects && work.subjects[0]) || 'World Classics',
        shelf: 'Global Library',
        rack: 'OL-WORK',
        isbn: key,
        rating: 4.7,
        reviewsCount: 150,
        description: desc,
        coverImage: coverImage,
        isDigitalArchive: true,
        isGlobal: true,
        globalSource: 'Open Library World Catalog',
        readOnlineUrl: `https://openlibrary.org/works/${key}`,
        embedReaderUrl: null,
        pdfUrl: null,
        hasDirectPdf: false
      };
    } catch (e) {
      console.error('Error fetching OL book:', e);
      return null;
    }
  }

  return null;
}
