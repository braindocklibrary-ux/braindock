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

// Safe string converter that handles arrays, objects, null, undefined without ever crashing
export const sanitizeString = (val) => {
  if (Array.isArray(val)) {
    return val.filter(Boolean).map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(', ');
  }
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return val.name || val.value || val.title || '';
  }
  return String(val);
};

export const formatLanguage = (code) => {
  if (!code) return 'World Languages';
  const c = sanitizeString(code).toLowerCase().trim();
  return LANGUAGE_MAP[c] || (c.charAt(0).toUpperCase() + c.slice(1));
};

// Calculate search relevance score so exact and close title matches ALWAYS appear first (#1)
export function calculateRelevance(book, query) {
  if (!book || !query) return 0;
  const q = sanitizeString(query).toLowerCase().trim();
  const title = sanitizeString(book.title).toLowerCase().trim();
  const author = sanitizeString(book.author).toLowerCase().trim();
  const originalTitle = sanitizeString(book.originalScriptTitle).toLowerCase().trim();
  
  let score = 0;

  // 1. Exact Title Match (e.g. query "ugly love" matches title "ugly love") -> Highest possible priority
  if (title === q || originalTitle === q) {
    score += 15000;
  } 
  // 2. Title starts with exact query (e.g. "Ugly Love: A Novel" or "Ugly Love - Special Edition")
  else if (title.startsWith(q + ' ') || title.startsWith(q + ':') || title.startsWith(q + '-') || originalTitle.startsWith(q)) {
    score += 8000;
  } 
  // 3. Title contains full query as a phrase
  else if (title.includes(q) || originalTitle.includes(q)) {
    score += 4000;
  }

  // 4. Token-level matching (all words match in title)
  const qWords = q.split(/[\s\-:_]+/).filter(w => w.length > 1);
  const titleWords = title.split(/[\s\-:_]+/).filter(w => w.length > 1);
  let matchedWordCount = 0;

  for (const qw of qWords) {
    if (titleWords.includes(qw)) {
      matchedWordCount++;
      score += 600;
    } else if (title.includes(qw)) {
      score += 250;
    }
  }

  // Huge bonus if every single word in query matches words in the title
  if (qWords.length > 1 && matchedWordCount === qWords.length) {
    score += 3000;
  }

  // 5. Author match
  if (author === q) {
    score += 3500;
  } else if (author.startsWith(q)) {
    score += 2000;
  } else if (author.includes(q)) {
    score += 800;
  }

  // 6. Prefer titles that are closer in length to the query
  // Ensures "Ugly Love" (9 chars) scores higher than "The Ugly Love Story of an 18th Century Sailor" (46 chars)
  const lenDiff = Math.abs(title.length - q.length);
  score += Math.max(0, 300 - lenDiff * 5);

  // 7. Boost if has authentic high-resolution cover image
  const cover = sanitizeString(book.coverImage);
  if (cover && !cover.includes('unsplash.com')) {
    score += 150;
  }

  // 8. Boost if popular / high ratings
  if (book.reviewsCount) {
    score += Math.min(150, Number(book.reviewsCount) || 0);
  }

  return score;
}

// Safe fetch helper with timeout signal and user-agent
const safeFetchJson = async (url, timeoutMs = 6000) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BrainDockLibrary/1.0',
        'Accept': 'application/json'
      }
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

export async function searchGlobalBooks(query, options = {}) {
  const { limit = 24, language = 'All' } = options;
  if (!query || query.trim().length === 0) return [];

  const cleanQ = query.trim();

  // 1. Search Open Library (World catalog of 30M+ modern & classic books)
  const olPromise = (async () => {
    try {
      const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQ)}&limit=20`;
      const json = await safeFetchJson(olUrl, 7000);
      if (!json || !json.docs) return [];
      const docs = json.docs;

      return docs.map(doc => {
        try {
          const lang = formatLanguage(Array.isArray(doc.language) ? doc.language[0] : doc.language);
          const coverId = doc.cover_i;
          const coverImage = coverId 
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
          
          const iaId = Array.isArray(doc.ia) ? doc.ia[0] : doc.ia;
          const pdfUrl = iaId ? `https://archive.org/download/${iaId}/${iaId}.pdf` : null;
          const author = sanitizeString(doc.author_name);
          const title = sanitizeString(doc.title);

          return {
            bookId: `OL-${sanitizeString(doc.key).replace('/works/', '') || Math.random().toString(36).substring(7)}`,
            title: title || 'World Literature',
            author: author || 'Global Author',
            publicationYear: doc.first_publish_year || (Array.isArray(doc.publish_year) ? doc.publish_year[0] : 'Contemporary'),
            publisher: sanitizeString(doc.publisher) || 'International Publisher',
            language: lang,
            category: sanitizeString(doc.subject) || 'World Literature',
            shelf: 'Global Open Library',
            rack: 'OL-GLOBAL',
            isbn: sanitizeString(doc.isbn) || 'Global Edition',
            rating: 4.8,
            reviewsCount: Number(doc.already_read_count) || 210,
            description: `Acclaimed international edition cataloged in the open global library. First published in ${doc.first_publish_year || 'modern archives'}.`,
            coverImage: coverImage,
            isDigitalArchive: true,
            isGlobal: true,
            globalSource: 'Open Library World Catalog',
            readOnlineUrl: doc.key ? `https://openlibrary.org${doc.key}` : `https://openlibrary.org/search?q=${encodeURIComponent(title)}`,
            embedReaderUrl: iaId ? `https://archive.org/embed/${iaId}` : null,
            pdfUrl: pdfUrl,
            hasDirectPdf: !!pdfUrl
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (err) {
      console.warn('OL search warning:', err.message);
      return [];
    }
  })();

  // 2. Search Google Books API (Gold standard for modern bestsellers, exact title matches, Colleen Hoover, etc.)
  const gbPromise = (async () => {
    try {
      const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQ)}&maxResults=20`;
      const json = await safeFetchJson(gbUrl, 6000);
      if (!json || !json.items) return [];
      const items = json.items;

      return items.map(item => {
        try {
          const vi = item.volumeInfo || {};
          const authors = sanitizeString(vi.authors) || 'Global Author';
          const title = sanitizeString(vi.title) || 'World Volume';
          const thumb = vi.imageLinks?.thumbnail || vi.imageLinks?.smallThumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
          const secureThumb = sanitizeString(thumb).replace(/^http:\/\//i, 'https://');

          return {
            bookId: `GB-${item.id}`,
            title: title,
            author: authors,
            publicationYear: vi.publishedDate ? sanitizeString(vi.publishedDate).substring(0, 4) : 'Contemporary',
            publisher: sanitizeString(vi.publisher) || 'International Publishing',
            language: vi.language ? formatLanguage(vi.language) : 'English',
            category: sanitizeString(vi.categories) || 'World Bestseller',
            shelf: 'Global Best-Sellers',
            rack: 'GB-WORLD',
            isbn: sanitizeString(vi.industryIdentifiers?.[0]?.identifier) || item.id,
            rating: Number(vi.averageRating) || 4.8,
            reviewsCount: Number(vi.ratingsCount) || 380,
            pdfPages: Number(vi.pageCount) || 320,
            description: vi.description ? sanitizeString(vi.description).substring(0, 350) + '...' : 'Acclaimed international literary work available across world digital library archives.',
            coverImage: secureThumb,
            isDigitalArchive: true,
            isGlobal: true,
            globalSource: 'Google Books & World Library Catalog',
            readOnlineUrl: vi.previewLink || `https://books.google.com/books?id=${item.id}`,
            embedReaderUrl: null,
            pdfUrl: null,
            hasDirectPdf: false
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (err) {
      console.warn('Google Books search warning:', err.message);
      return [];
    }
  })();

  // 3. Search Internet Archive (100% Full Unrestricted Books & Historical Scans)
  const iaPromise = (async () => {
    try {
      const iaUrl = `https://archive.org/advancedsearch.php?q=(${encodeURIComponent(cleanQ)})+AND+mediatype:(texts)+AND+NOT+access-restricted-item:true&fl[]=identifier,title,creator,year,language,description,downloads,access-restricted-item&sort[]=downloads+desc&output=json&rows=20`;
      const json = await safeFetchJson(iaUrl, 6000);
      if (!json || !json.response || !json.response.docs) return [];
      const docs = json.response.docs;

      return docs
        .filter(doc => !doc['access-restricted-item'] || doc['access-restricted-item'] === 'false')
        .map(doc => {
          try {
            const lang = formatLanguage(Array.isArray(doc.language) ? doc.language[0] : doc.language);
            const title = sanitizeString(doc.title) || 'Classical Volume';
            const author = sanitizeString(doc.creator) || 'Historical Archive';
            const year = sanitizeString(doc.year) || 'Historical';
            return {
              bookId: `IA-${doc.identifier}`,
              title: title,
              author: author,
              publicationYear: year,
              publisher: 'Internet Archive Global Repository',
              language: lang,
              category: 'World Digital Archive',
              shelf: 'Digital Cloud Vault',
              rack: 'IA-PDF',
              rating: 4.8,
              reviewsCount: Number(doc.downloads) || 150,
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
          } catch {
            return null;
          }
        }).filter(Boolean);
    } catch (err) {
      console.warn('IA search warning:', err.message);
      return [];
    }
  })();

  const [olBooks, gbBooks, iaBooks] = await Promise.all([olPromise, gbPromise, iaPromise]);

  // Merge and deduplicate by normalized title
  const seen = new Set();
  const merged = [];

  // Combine Google Books, Open Library, and Internet Archive
  for (const b of [...gbBooks, ...olBooks, ...iaBooks]) {
    if (!b) continue;
    const key = sanitizeString(b.title).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(b);
    }
  }

  // Filter by language if specified
  let filtered = merged;
  if (language && language !== 'All') {
    filtered = merged.filter(b => {
      const bLang = sanitizeString(b.language);
      return bLang.toLowerCase().includes(language.toLowerCase());
    });
  }

  // Sort by search relevance score so EXACT and closest title matches appear at the VERY TOP (#1)
  filtered.sort((a, b) => {
    const scoreB = calculateRelevance(b, cleanQ);
    const scoreA = calculateRelevance(a, cleanQ);
    return scoreB - scoreA;
  });

  return filtered.slice(0, limit);
}

export async function getGlobalBookById(id) {
  if (!id) return null;

  if (id.startsWith('GB-')) {
    const gbId = id.replace('GB-', '');
    try {
      const json = await safeFetchJson(`https://www.googleapis.com/books/v1/volumes/${gbId}`);
      if (!json || !json.volumeInfo) return null;
      const vi = json.volumeInfo;
      const authors = sanitizeString(vi.authors) || 'Global Author';
      const title = sanitizeString(vi.title) || 'World Title';
      const thumb = vi.imageLinks?.thumbnail || vi.imageLinks?.medium || vi.imageLinks?.smallThumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
      const secureThumb = sanitizeString(thumb).replace(/^http:\/\//i, 'https://');

      return {
        bookId: id,
        title: title,
        author: authors,
        publisher: sanitizeString(vi.publisher) || 'International Publishing',
        publicationYear: vi.publishedDate ? sanitizeString(vi.publishedDate).substring(0, 4) : 'Contemporary',
        language: vi.language ? formatLanguage(vi.language) : 'English',
        category: sanitizeString(vi.categories) || 'World Bestseller',
        shelf: 'Global Best-Sellers',
        rack: 'GB-WORLD',
        isbn: sanitizeString(vi.industryIdentifiers?.[0]?.identifier) || gbId,
        rating: Number(vi.averageRating) || 4.8,
        reviewsCount: Number(vi.ratingsCount) || 350,
        pdfPages: Number(vi.pageCount) || 320,
        description: vi.description ? sanitizeString(vi.description) : 'Acclaimed international literary work available across world digital library archives.',
        coverImage: secureThumb,
        isDigitalArchive: true,
        isGlobal: true,
        globalSource: 'Google Books & World Library Catalog',
        readOnlineUrl: vi.previewLink || `https://books.google.com/books?id=${gbId}`,
        embedReaderUrl: null,
        pdfUrl: null,
        hasDirectPdf: false
      };
    } catch (e) {
      console.error('Error fetching GB book:', e);
      return null;
    }
  }

  if (id.startsWith('IA-')) {
    const identifier = id.replace('IA-', '');
    try {
      const json = await safeFetchJson(`https://archive.org/metadata/${identifier}`);
      if (!json) return null;
      const meta = json.metadata || {};
      const files = json.files || [];
      const pdfFile = files.find(f => f.name?.toLowerCase().endsWith('.pdf'));
      const isRestricted = meta['access-restricted-item'] === 'true' || meta['access-restricted-item'] === true;

      return {
        bookId: id,
        title: sanitizeString(meta.title) || identifier,
        author: sanitizeString(meta.creator) || 'Classical Author',
        publisher: sanitizeString(meta.publisher) || 'Internet Archive & World Libraries',
        publicationYear: sanitizeString(meta.year || meta.date) || 'Historical',
        language: formatLanguage(Array.isArray(meta.language) ? meta.language[0] : meta.language),
        category: sanitizeString(meta.subject) || 'World Digital Archive',
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
      const work = await safeFetchJson(`https://openlibrary.org/works/${key}.json`);
      if (!work) return null;

      let desc = typeof work.description === 'string' ? work.description : (work.description?.value || 'Work cataloged in Open Library global database.');

      const coverId = work.covers?.[0];
      const coverImage = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';

      return {
        bookId: id,
        title: sanitizeString(work.title) || 'World Title',
        author: 'Global Literary Collection',
        publisher: 'International Publishers',
        publicationYear: work.created?.value ? sanitizeString(work.created.value).substring(0, 4) : 'Cataloged',
        language: 'World Literature',
        category: sanitizeString(work.subjects) || 'World Classics',
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
