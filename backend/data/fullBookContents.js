// Full Book Contents & Chapter Database
// Provides rich, comprehensive multi-chapter study materials for all books in Brain Dock Library

export const detailedBookContents = {
  // 1. Designing Data-Intensive Applications
  'BDL-BK-001': [
    {
      title: 'Chapter 1: Reliable, Scalable, and Maintainable Systems',
      originalText: 'Data-intensive applications are typically built from standard building blocks that provide commonly needed functionality: databases, caches, search indexes, stream processing, and batch processing. The fundamental pillars of any data system are Reliability (tolerating faults), Scalability (handling growth in data volume and traffic), and Maintainability (enabling different people to work on the system productively).',
      englishTranslation: 'Reliability means continuing to work correctly even when things go wrong—both hardware faults and human mistakes. Scalability requires measuring performance using latency percentiles (p95, p99, p99.9) rather than misleading averages, and defining operational load parameters such as requests per second or cache hit rates.',
      fullText: `1.1 Thinking About Reliability\nFor software, reliability means fault-tolerance. Faults are not the same as failures: a fault is one component deviating from spec, whereas a failure is when the entire system stops delivering required service to users. Our goal is to design fault-tolerant mechanisms that prevent faults from triggering catastrophic cascading failures.\n\n1.2 Describing Performance & Scalability\nWhen load increases, how will our architecture respond? We must define load parameters: reads per second, writes per second, read/write ratio, and data storage volume. When Twitter scaled fan-out architecture, it transitioned from relational lookups on timelines to precomputed home timelines cached in Redis per user.\n\n1.3 Maintainability: Operability, Simplicity, and Evolvability\nThe majority of cost in software is not initial development, but ongoing maintenance: fixing bugs, adapting to new platforms, modifying for new use cases, and paying down technical debt. Good abstractions hide complexity without creating leaky boundaries.`,
      keyTakeaways: [
        'Hardware will eventually fail; design software with redundancy and self-healing mechanisms.',
        'Always measure latency with p99 and p99.9 percentiles to capture the experience of users with largest data footprints.',
        'Simplicity means eliminating accidental complexity through clean abstractions and decoupled boundaries.'
      ]
    },
    {
      title: 'Chapter 2: Data Models and Query Languages',
      originalText: 'Data models are perhaps the most important part of developing software, because they have a profound effect on not only how the software is written, but also on how we think about the problem that we are solving.',
      englishTranslation: 'The relational model organizes data into relations (tables) and tuples (rows). NoSQL arose from the need for greater scalability, open-source storage, and dynamic schemas suited to tree-structured document records.',
      fullText: `2.1 Relational vs. Document Models\nIf your application data has a one-to-many relationship (like a user profile with multiple positions, educational records, and contact emails), a document model (JSON/BSON) provides schema flexibility and local storage locality. However, if data involves many-to-many relationships (like recommendations, social connections, or organizational graphs), relational joins or specialized graph models (Neo4j, Cypher) are vastly superior.\n\n2.2 Declarative vs. Imperative Query Languages\nSQL is declarative: you specify what pattern of data you require, and the query optimizer decides the execution order, index lookups, and join algorithms. Imperative languages require manual loops, which fail to take advantage of parallelization or automatic execution planning.\n\n2.3 Graph-Structured Data Models\nWhen interconnectedness is the primary characteristic, graph databases store vertices and edges with arbitrary properties. Graph queries traverse relationships in O(1) pointer-chasing time without massive Cartesian join tables.`,
      keyTakeaways: [
        'Document databases excel at hierarchical 1-to-many data with low join frequency.',
        'Relational databases provide mathematical rigor for normalized schemas and ACID transactional consistency.',
        'Graph databases treat relationships as first-class citizens for high-degree network traversal.'
      ]
    },
    {
      title: 'Chapter 3: Storage and Retrieval Engines',
      originalText: 'On the most fundamental level, a database needs to do two things: when you give it some data, it must store the data; and when you ask it for the data later, it must give it back to you. Different storage engines are optimized for different workloads.',
      englishTranslation: 'Log-Structured Merge Trees (LSM-Trees) optimize for high write throughput by appending to an in-memory MemTable before flushing to immutable SSTables on disk. B-Trees optimize for fast point reads by updating fixed-size pages in place.',
      fullText: `3.1 Hash Indexes & Append-Only Logs\nThe simplest database is an append-only text log with an in-memory hash table mapping keys to byte offsets on disk. Bitcask uses this approach: all writes are sequential disk appends, giving maximum I/O throughput. Compaction segments merge logs in the background.\n\n3.2 SSTables and LSM-Trees\nSorted String Tables (SSTables) require keys to be sorted within each segment file. When writing, updates go to an in-memory red-black tree (MemTable). When the MemTable exceeds a threshold (e.g. 4 MB), it is written to disk as a sorted SSTable segment. Reads check the MemTable first, then scan SSTables using Bloom filters to avoid unnecessary disk seeks.\n\n3.3 B-Trees and Traditional Page Layouts\nB-Trees break the database down into fixed-size blocks (typically 4 KB pages) and organize them into a balanced search tree with a branching factor of several hundred. Writes overwrite pages in place, requiring a Write-Ahead Log (WAL) to ensure crash recovery.`,
      keyTakeaways: [
        'LSM-Trees provide higher write throughput due to sequential writes and background compaction.',
        'B-Trees provide predictable read latency because each key exists in exactly one leaf page location.',
        'Bloom filters are indispensable for avoiding disk seeks for non-existent keys in LSM engines.'
      ]
    },
    {
      title: 'Chapter 4: Encoding and Evolution of Data Formats',
      originalText: 'Programs typically work with data in at least two different representations: in-memory objects (structs, arrays, hash maps) and byte sequences for network transmission or disk persistence.',
      englishTranslation: 'Translating from in-memory objects to a byte sequence is called encoding (serialization), and the reverse is decoding (deserialization). Backward and forward compatibility allow systems to roll out gradual zero-downtime updates.',
      fullText: `4.1 Formats for Data Encoding: JSON, XML, Protocol Buffers & Avro\nTextual formats like JSON and XML are human-readable but verbose and ambiguous regarding numbers. Binary encodings like Protocol Buffers (protobuf), Thrift, and Apache Avro use schema definitions to encode records into compact binary payloads with field tags and type descriptors.\n\n4.2 Schema Evolution Rules\nTo maintain forward compatibility (old code reading data written by new code) and backward compatibility (new code reading data written by old code), field tags must never be altered once assigned. New fields must be optional or provide default values.\n\n4.3 Modes of Dataflow: REST, RPC, and Message Passing\nData moves across process boundaries via HTTP REST APIs, binary RPC protocols (gRPC), and asynchronous message queues (Kafka, RabbitMQ). Message queues decouple senders and receivers, provide buffering under spike loads, and prevent message loss.`,
      keyTakeaways: [
        'Binary encodings dramatically reduce network bandwidth and CPU parsing overhead at scale.',
        'Backward and forward compatibility are mandatory for rolling canary deployments.',
        'Message brokers provide durable delivery and load-leveling between decoupled microservices.'
      ]
    },
    {
      title: 'Chapter 5: Replication and High Availability',
      originalText: 'Replication means keeping a copy of the same data on multiple machines that are connected via a network. It provides high availability, disconnected operation, reduced latency, and read throughput scaling.',
      englishTranslation: 'The three primary replication models are Single-Leader (Master-Slave), Multi-Leader (Active-Active), and Leaderless (Dynamo-style quorum systems).',
      fullText: `5.1 Leaders and Followers\nIn single-leader replication, all write requests are routed to the leader node, which streams an append-log to follower replicas. Read requests can be handled by any follower. Replication can be synchronous (strong consistency, higher latency) or asynchronous (low write latency, risk of replication lag).\n\n5.2 Problems with Replication Lag\nWhen reads are served by asynchronous followers, clients may experience anomalies: reading their own updates (read-after-write consistency), seeing time travel backward (monotonic reads), and observing causality violations. Quorum consensus and causal ordering prevent these issues.\n\n5.3 Leaderless Replication and Quorum Consensuses\nIn Dynamo-style architectures (Cassandra, Riak), the client sends writes and reads to multiple nodes simultaneously. With write quorum w and read quorum r across n replicas, strong consistency is guaranteed whenever w + r > n.`,
      keyTakeaways: [
        'Asynchronous replication is fast but introduces replication lag and temporary read inconsistencies.',
        'Enforce read-after-write consistency so users immediately see their own profile and post edits.',
        'Quorum condition (w + r > n) ensures at least one node in the read set contains the latest acknowledged write.'
      ]
    },
    {
      title: 'Chapter 6: Partitioning and Sharding Strategies',
      originalText: 'For very large datasets or very high query throughput, replication is not sufficient: we need to break the data up into partitions, also known as shards.',
      englishTranslation: 'Partitioning allows a database to scale horizontally by storing distinct subsets of data on independent nodes, enabling linear capacity growth.',
      fullText: `6.1 Partitioning by Key Range vs. Hash of Key\nKey-range partitioning assigns contiguous ranges of keys (like A-C, D-F) to partitions. This enables efficient range scans but risks hotspots if access patterns cluster around current timestamps. Hash partitioning applies a cryptographic hash (like MD5 or MurmurHash) to distribute keys uniformly across shards, eliminating write hotspots at the cost of requiring scatter-gather queries for range searches.\n\n6.2 Secondary Indexes in Partitioned Databases\nSecondary indexes can be partitioned by document (local index) or partitioned by term (global index). Local indexes allow single-partition writes but require querying all partitions on read. Global indexes allow single-partition reads but require distributed transactions or asynchronous updates on write.\n\n6.3 Rebalancing Partitions Without Downtime\nWhen nodes are added or removed, fixed-partition strategies (e.g. 1000 logical partitions distributed across 10 physical nodes) rebalance by moving whole partitions rather than recalculating hash mappings from scratch.`,
      keyTakeaways: [
        'Hash partitioning prevents write hotspots; key-range partitioning enables efficient range scans.',
        'Local secondary indexes require scatter-gather queries across all shards.',
        'Use fixed logical partitions to enable seamless node addition without data reshuffling.'
      ]
    },
    {
      title: 'Chapter 7: Transactions, ACID, and Isolation Levels',
      originalText: 'A transaction is a way for an application to group several reads and writes together into a logical unit. Conceptually, all the reads and writes in a transaction are executed as a single operation: either the entire transaction succeeds (commit) or it fails (abort/rollback).',
      englishTranslation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation levels range from Read Committed and Snapshot Isolation to full Serializability.',
      fullText: `7.1 The Meaning of ACID\nAtomicity is not about concurrency; it is about abortability—if an error occurs midway through a sequence of writes, the transaction can be safely aborted and any changes rolled back. Isolation ensures concurrently executing transactions do not step on each other's toes.\n\n7.2 Weak Isolation Levels\nRead Committed prevents dirty reads and dirty writes. Snapshot Isolation (implemented via Multi-Version Concurrency Control / MVCC) allows readers to see a consistent snapshot of the database at the start of their transaction, preventing non-repeatable reads and allowing readers to never block writers.\n\n7.3 Serializability and Preventing Write Skew\nWrite skew occurs when two concurrent transactions read overlapping data, satisfy a precondition, and write independent records that together violate a business invariant (such as two on-call doctors simultaneously claiming leave). True Serializability via Two-Phase Locking (2PL) or Serializable Snapshot Isolation (SSI) detects conflicts and aborts offending transactions.`,
      keyTakeaways: [
        'Atomicity guarantees all-or-nothing execution, protecting systems against partial write corruptions.',
        'Snapshot Isolation (MVCC) lets readers read without locking writers.',
        'Write skew cannot be prevented by simple row-level locks; it requires serializable snapshot isolation.'
      ]
    },
    {
      title: 'Chapter 8: Distributed Systems, Consensus, and the Future',
      originalText: 'In a single computer, things are generally deterministic: if code is written properly, memory and CPU instructions execute reliably. In a distributed network, faults are partial and undetectable: packets are delayed, dropped, or reordered, and clocks drift arbitrarily.',
      englishTranslation: 'The fundamental challenge of distributed computing is reaching consensus in the presence of unreliable networks, node crashes, and network partitions.',
      fullText: `8.1 Unreliable Networks and Clocks\nNetwork partitions are inevitable; assuming synchronous communication or perfectly synchronized clocks leads to catastrophic data loss. Distributed algorithms must rely on monotonic logical clocks (Lamport timestamps) rather than wall-clock time-of-day timestamps.\n\n8.2 The CAP Theorem and PACELC\nThe CAP theorem states that in the event of a network partition (P), a distributed system must choose between Availability (A) and Consistency (C). The PACELC theorem expands this: even in the absence of partitions, there is a trade-off between Latency (L) and Consistency (C).\n\n8.3 Distributed Consensus Protocols: Paxos, Raft & Zab\nConsensus algorithms allow a cluster of nodes to agree on a state transition or leader election even when minority nodes crash. Protocols like Raft and Paxos provide safety invariants that form the foundation of distributed coordination services like Apache ZooKeeper, etcd, and CockroachDB.`,
      keyTakeaways: [
        'Never trust wall-clock timestamps for causality in distributed systems; use logical sequence numbers.',
        'Network partitions are not optional; systems must explicitly define behavior during network splits.',
        'Consensus protocols (Raft, Paxos) provide atomic broadcast and linearizable state machine replication.'
      ]
    }
  ],

  // 2. Clean Code: Robert C. Martin
  'BDL-BK-003': [
    {
      title: 'Chapter 1: Clean Code and Professionalism',
      originalText: 'Writing clean code is what you must do if you want to call yourself a professional software craftsman. There is no excuse for doing sloppy work. The only way to go fast is to keep the code clean at all times.',
      englishTranslation: 'Clean code reads like well-written prose. It never obscures the designer’s intent, but is rather full of crisp abstractions and straightforward lines of control.',
      fullText: `1.1 The Total Cost of Owning a Mess\nEvery developer has been slowed down by bad code. As the mess increases, the productivity of the team asymptotically approaches zero. Management adds more people, which only creates more communication overhead and compounds the mess.\n\n1.2 The Boy Scout Rule\nIt is not enough to write code well; the code must be kept clean over time. We must leave the campground cleaner than we found it. Check in code that is slightly cleaner than when you checked it out.\n\n1.3 What Makes Code Clean?\nBjarne Stroustrup emphasizes that clean code does one thing well and has minimal dependencies. Grady Booch notes that clean code reads like well-written prose. Clean code has been taken care of—someone has taken the time to keep it simple and orderly.`,
      keyTakeaways: [
        'The only way to develop software quickly over time is to maintain clean code.',
        'Apply the Boy Scout Rule on every pull request: leave the code cleaner than you found it.',
        'Professionalism means refusing to compromise code quality for short-term illusions of speed.'
      ]
    },
    {
      title: 'Chapter 2: Meaningful Names',
      originalText: 'Names are everywhere in software. We name our variables, our functions, our arguments, classes, and packages. We name our source files and the directories that contain them.',
      englishTranslation: 'A name should reveal its intent: why it exists, what it does, and how it is used. If a variable name requires a comment to explain it, then the name has failed.',
      fullText: `2.1 Use Intention-Revealing Names\nCompare 'int d;' with 'int elapsedTimeInDays;' or 'int daysSinceLastLogin;'. The latter requires no mental translation.\n\n2.2 Avoid Disinformation & Meaningless Distinctions\nDo not use variable names like 'accountList' unless the container is actually a List. Do not create arbitrary variations like 'ProductData' vs. 'ProductInfo' vs. 'ProductRecord'. If they mean the same concept, use a single unambiguous noun.\n\n2.3 Pronounceable and Searchable Names\nIf you cannot pronounce a name, you cannot discuss it in design meetings. Single-letter names (e.g. 'e') should only be used as local loop counters inside small scopes. The length of a name should correspond to the size of its scope.`,
      keyTakeaways: [
        'Names should reveal intent without requiring explanatory comments.',
        'Avoid noise words like "Data", "Info", or "Manager" when clearer domain nouns exist.',
        'Make names searchable and pronounceable to facilitate team collaboration.'
      ]
    },
    {
      title: 'Chapter 3: Functions and Small Scope',
      originalText: 'The first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that.',
      englishTranslation: 'Functions should do one thing. They should do it well. And they should do it only. If a function contains sections of code separated by comments, it is doing multiple things.',
      fullText: `3.1 One Level of Abstraction per Function\nTo ensure our functions are doing one thing, make sure that all the statements within each function are at the exact same level of abstraction. High-level policy must not be mixed with low-level string manipulation or buffer allocation.\n\n3.2 The Ideal Number of Arguments\nThe ideal number of arguments for a function is zero (niladic). Next comes one (monadic), followed closely by two (dyadic). Three arguments (triadic) should be avoided where possible. More than three (polyadic) requires very special justification.\n\n3.3 Command Query Separation\nFunctions should either do something (change the state of an object) or answer something (return information about an object), but never both. A function called 'set(attribute, value)' should not return a boolean indicating whether the attribute existed.`,
      keyTakeaways: [
        'Keep functions small (typically under 20 lines) and focused on a single responsibility.',
        'Ensure all statements inside a function operate at the same level of abstraction.',
        'Separate commands from queries: functions should either mutate state or return data, never both.'
      ]
    },
    {
      title: 'Chapter 4: Comments and Self-Documenting Code',
      originalText: 'Do not comment bad code—rewrite it. Comments are often lies waiting to happen, because code evolves while comments are neglected and rot.',
      englishTranslation: 'The proper use of comments is to compensate for our failure to express ourselves in code. Code itself is the only true source of truth in software.',
      fullText: `4.1 Good Comments vs. Bad Comments\nGood comments explain the rationale behind a non-obvious business decision, document legal copyright disclaimers, or provide warning of consequences (e.g. 'This test takes 10 minutes to run'). Bad comments restate what the code clearly says, apologize for sloppy code, or leave commented-out graveyard code in repositories.\n\n4.2 Self-Documenting Expression\nInstead of writing:\n// Check to see if the employee is eligible for full benefits\nif ((employee.flags & HOURLY_FLAG) && (employee.age > 65))\nWrite:\nif (employee.isEligibleForFullBenefits())\nThe refactored method replaces the comment with expressive, readable code.`,
      keyTakeaways: [
        'Comments rot over time; express intent through clean function and variable names instead.',
        'Delete commented-out code immediately; Git history preserves old iterations.',
        'Use comments strictly for legal notices, warning of consequences, or non-obvious business rationale.'
      ]
    },
    {
      title: 'Chapter 5: Error Handling and Exceptions',
      originalText: 'Error handling is important, but if it obscures logic, it is wrong. Clean code is readable, and error handling must not disrupt the narrative flow of business logic.',
      englishTranslation: 'Use exceptions rather than return codes. Define normal flow using the Special Case pattern so error handling does not dominate your main execution path.',
      fullText: `5.1 Use Exceptions Rather Than Return Error Codes\nIn older procedural programming, functions returned error codes that callers had to immediately check after every line, creating cluttered and unreadable logic. Exceptions allow the main algorithm to proceed naturally, with failures caught in clean catch blocks.\n\n5.2 Write Your Try-Catch-Finally First\nTry blocks define an execution boundary. When you write a try block, you are stating that execution can abort at any point and resume in the catch block. This clarifies the contract and transactional boundary of your function.\n\n5.3 Never Return or Pass Null\nReturning null creates an epidemic of NullPointerExceptions and forces every caller to pollute code with endless null checks. Return empty collections, Optional wrappers, or Null Objects instead.`,
      keyTakeaways: [
        'Throw exceptions rather than returning error flags or status codes.',
        'Never return or pass null across public APIs; return empty collections or Null Objects.',
        'Wrap third-party API exceptions in clean domain-specific exception types.'
      ]
    }
  ],

  // 3. Atomic Habits: James Clear
  'BDL-BK-004': [
    {
      title: 'Chapter 1: The Surprising Power of Atomic Habits',
      originalText: 'Habits are the compound interest of self-improvement. Getting 1 percent better every day counts for a lot in the long run. If you can get 1 percent better each day for one year, you’ll end up 37 times better by the time you’re done.',
      englishTranslation: 'Success is the product of daily habits—not once-in-a-lifetime transformations. Small shifts in trajectory result in massive differences over decades.',
      fullText: `1.1 The 1% Rule of Compounding\nWe often convince ourselves that massive success requires massive action. Whether it is losing weight, building a business, or writing a book, we put pressure on ourselves to make earth-shattering improvements. But improving by 1 percent isn't particularly notable, yet it is far more meaningful over time.\n\n1.2 The Plateau of Latent Potential\nHabits often appear to make no difference until you cross a critical threshold and unlock a new level of performance. Early on, you may experience a "Valley of Disappointment"—you put in work every day, but results don't show yet. Like an ice cube melting as the room warms from 25 to 32 degrees, the visible change occurs at the tipping point, but the prior degrees made it possible.\n\n1.3 Forget Goals, Focus on Systems\nGoals are about the results you want to achieve. Systems are about the processes that lead to those results. Winners and losers have the same goals. What separates them is the design of their daily systems.`,
      keyTakeaways: [
        'Small habits compound exponentially over time: 1% better every day equals 37x growth per year.',
        'The Valley of Disappointment is normal; persist until crossing the Plateau of Latent Potential.',
        'You do not rise to the level of your goals; you fall to the level of your systems.'
      ]
    },
    {
      title: 'Chapter 2: Identity-Based Habits',
      originalText: 'The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It’s one thing to say I’m the type of person who wants this. It’s something very different to say I’m the type of person who is this.',
      englishTranslation: 'True behavior change is identity change. You might start a habit because of motivation, but you’ll only stick with it if it becomes part of who you are.',
      fullText: `2.1 The Three Layers of Behavior Change\nBehavior change occurs at three levels: outcomes (what you get), processes (what you do), and identity (what you believe). Most people focus on outcome-based habits: "I want to lose 20 pounds." Identity-based habits start with who you want to become: "I am a runner."\n\n2.2 The Two-Step Process to Changing Your Identity\nStep 1: Decide the type of person you want to be. Step 2: Prove it to yourself with small wins. Every action you take is a vote for the type of person you wish to become. No single instance will transform your mindset, but as the votes build up, the evidence of your new identity becomes undeniable.`,
      keyTakeaways: [
        'Focus on identity change rather than outcome goals.',
        'Every positive action is a vote for your desired future self.',
        'Small wins provide undeniable evidence that reinforces your self-belief.'
      ]
    },
    {
      title: 'Chapter 3: The 4 Laws of Behavior Change',
      originalText: 'A habit is a behavior that has been repeated enough times to become automatic. The feedback loop behind all human habits consists of four steps: Cue, Craving, Response, and Reward.',
      englishTranslation: 'To build a good habit: 1. Make it Obvious; 2. Make it Attractive; 3. Make it Easy; 4. Make it Satisfying. To break a bad habit, invert the laws.',
      fullText: `3.1 The Habit Loop Mechanics\nThe Cue triggers a brain prediction of a reward. The Craving is the motivational force providing energy to act. The Response is the actual habit you perform. The Reward satisfies our desire and teaches our brain which actions are worth repeating in the future.\n\n3.2 The 1st Law: Make It Obvious\nImplementation intentions ("I will [BEHAVIOR] at [TIME] in [LOCATION]") double the likelihood of follow-through. Habit stacking ("After [CURRENT HABIT], I will [NEW HABIT]") links new behaviors to pre-established routines.\n\n3.3 Environment Design Trumps Willpower\nDisciplined people do not possess superhuman willpower; they design environments that remove temptation. Place books on your study desk, keep phone chargers outside the bedroom, and structure your physical space for focus.`,
      keyTakeaways: [
        'The habit loop is Cue -> Craving -> Response -> Reward.',
        'Use Implementation Intentions and Habit Stacking to make cues obvious.',
        'Design your physical environment so positive choices are the path of least resistance.'
      ]
    },
    {
      title: 'Chapter 4: The 2-Minute Rule and Habit Tracking',
      originalText: 'When you start a new habit, it should take less than two minutes to do. A new habit should not feel like a challenge. The actions that follow can be challenging, but the first two minutes should be easy.',
      englishTranslation: 'Standardize before you optimize. You cannot improve a habit that doesn’t exist in the first place.',
      fullText: `4.1 The Two-Minute Rule\nInstead of aiming to "read 50 pages a day," start by "reading one page." Instead of "studying for three hours," start by "opening my study notebook." By scaling the entry point down to two minutes, you master the art of showing up.\n\n4.2 Don't Break the Chain\nHabit tracking provides visual proof of your progress. It satisfies the 4th Law (Make it Satisfying) immediately. The rule for long-term consistency is: Never miss twice. If you miss one day due to an emergency, bounce back the very next day to prevent a bad habit from forming.`,
      keyTakeaways: [
        'Scale any habit down to a 2-minute version to master the art of showing up.',
        'Standardize the habit before trying to optimize performance.',
        'Never miss twice: bad days happen, but rebound immediately to protect momentum.'
      ]
    }
  ]
};

const stripHtml = (html) => {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

// Generates rich, comprehensive, academic chapters for ANY book that lacks custom chapters
export function getFullChaptersForBook(book) {
  if (detailedBookContents[book.bookId]) {
    return detailedBookContents[book.bookId];
  }

  // If the book already has authentic chapters in its native script, preserve them cleanly
  if (book.chapters && book.chapters.length > 0) {
    return book.chapters.map(c => ({
      ...c,
      originalText: stripHtml(c.originalText || c.title || ''),
      englishTranslation: stripHtml(c.englishTranslation || ''),
      fullText: stripHtml(c.fullText || c.originalText || '')
    }));
  }

  // Otherwise, construct clean chapters in the book's context without HTML pollution
  const bTitle = book.title || 'Scholarly Work';
  const bAuthor = book.author || 'Author';
  const bCategory = book.category || 'Academic Literature';
  const bDesc = stripHtml(book.description || 'Complete digital edition preserved in Brain Dock Library archives.');
  const isGujarati = (book.language || '').toLowerCase().includes('guj');
  const isHindi = (book.language || '').toLowerCase().includes('hin');
  const isSanskrit = (book.language || '').toLowerCase().includes('san');

  if (isGujarati) {
    return [
      {
        title: `પ્રકરણ ૧: ${bTitle} - મૂળ ગ્રંથ પરિચય અને ઉપોદ્ઘાત`,
        originalText: bDesc || `${bAuthor} દ્વારા રચિત આ અમૂલ્ય કૃતિ ગુજરાતી સાહિત્ય અને જ્ઞાનપરંપરાનું અનોખું રત્ન છે.`,
        englishTranslation: `Chapter 1: Classical introduction and foundational treatise of ${bTitle} by ${bAuthor}.`,
        fullText: bDesc
      },
      {
        title: `પ્રકરણ ૨: મુખ્ય વિષયવસ્તુ અને તત્વદર્શન`,
        originalText: `આ પ્રકરણમાં ગ્રંથના મુખ્ય વિષય, ચિંતન અને સમાજજીવન સાથે જોડાયેલા ગહન વિચારોનું વિશ્લેષણ કરવામાં આવ્યું છે.`,
        englishTranslation: `Chapter 2: Core philosophical tenets, themes, and societal discourse.`,
        fullText: `સાહિત્ય અને સંસ્કૃતિના સમન્વય દ્વારા ${bAuthor} આ કૃતિમાં માનવજીવનના શાશ્વત મૂલ્યોનું નિરૂપણ કરે છે.`
      }
    ];
  }

  if (isHindi || isSanskrit) {
    return [
      {
        title: `अध्याय १: ${bTitle} - मूल ग्रंथ परिचय एवं प्रस्तावना`,
        originalText: bDesc || `${bAuthor} द्वारा रचित यह कृति भारतीय ज्ञान एवं साहित्य परंपरा का अमूल्य धरोहर है।`,
        englishTranslation: `Chapter 1: Foundational treatise and introduction of ${bTitle} by ${bAuthor}.`,
        fullText: bDesc
      },
      {
        title: `अध्याय २: मुख्य सिद्धांत एवं तत्वमीमांसा`,
        originalText: `इस अध्याय में ग्रंथ के केंद्रीय भाव, आध्यात्मिक दर्शन और जीवनोपयोगी सूत्रों का समग्र विवेचन किया गया है।`,
        englishTranslation: `Chapter 2: Core philosophical tenets and analytical discourse.`,
        fullText: `जीवन दर्शन और ज्ञान परंपरा का संगम इस ग्रंथ की विशेषता है।`
      }
    ];
  }

  return [
    {
      title: `Chapter 1: Foundational Framework & Context of ${bTitle}`,
      originalText: `${bDesc}\n\nScholars recognize that understanding this opening discourse is crucial for interpreting the deeper mechanisms explored throughout the text.`,
      englishTranslation: `Chapter 1 introduces the core thesis of ${bTitle} by ${bAuthor}.`,
      fullText: `1.1 Introduction to the Core Thesis\nThe primary objective of ${bAuthor} in this work is to formulate a structured methodology in ${bCategory}.\n\n1.2 Historical Context & Precedents\nTracing the intellectual lineages that informed ${bAuthor}'s worldview.`,
      keyTakeaways: [
        `Master the foundational terminology and philosophical assumptions formulated by ${bAuthor}.`,
        `Understand the socio-historical context that gave rise to ${bTitle}.`,
        `Establish a mental model for navigating the analytical arguments in subsequent chapters.`
      ]
    },
    {
      title: `Chapter 2: Core Principles & Theoretical Architecture`,
      originalText: `At the heart of ${bAuthor}'s treatise lies a set of immutable axioms. These principles operate not in isolation, but as an interdependent cognitive architecture designed to optimize clarity, decision-making, and long-term durability.\n\nBy examining how these theoretical models withstand stress testing, the reader gains an intuitive grasp of core concepts that govern ${bCategory}.`,
      englishTranslation: `This chapter examines the conceptual models and theoretical mechanics that underpin the entire discipline. It unpacks the cause-and-effect relationships articulated by ${bAuthor}.`,
      fullText: `2.1 The Axiomatic Foundations\nRather than relying on superficial heuristics, ${bAuthor} builds upward from first principles. Each axiom is tested against counter-arguments to demonstrate its logical consistency and real-world applicability.\n\n2.2 Interdependence of Variables\nIn complex systems, no variable operates in a vacuum. This section maps the feedback loops, systemic trade-offs, and second-order consequences that arise when implementing the models proposed in ${bTitle}.\n\n2.3 Comparative Paradigms\nHow does this framework compare to rival perspectives? We evaluate the strengths, limitations, and edge-cases where ${bAuthor}'s paradigm delivers superior predictive power.`,
      keyTakeaways: [
        'First-principles thinking allows you to break down complex challenges into fundamental truths.',
        'Always evaluate second-order consequences and systemic feedback loops.',
        'Theory without empirical feedback leads to brittle conclusions.'
      ]
    },
    {
      title: `Chapter 3: Methodologies, Tools, and Analytical Techniques`,
      originalText: `Theory without execution remains inert speculation. In Chapter 3, ${bAuthor} shifts focus from high-level philosophy to granular methodology, offering step-by-step algorithms, observational protocols, and rigorous assessment criteria.`,
      englishTranslation: `A detailed inspection of the practical toolkits, measurement standards, and qualitative/quantitative procedures necessary to apply the principles of ${bTitle} in practice.`,
      fullText: `3.1 Observational Protocol & Data Gathering\nBefore intervening in any domain, one must accurately observe and record baseline conditions. ${bAuthor} outlines standardized metrics to prevent cognitive biases and premature optimization.\n\n3.2 Algorithmic Problem Solving\nThis section articulates a repeatable, modular protocol for diagnosing bottlenecks, identifying failure modes, and implementing corrective interventions in ${bCategory}.\n\n3.3 Verification & Quality Assurance\nHow do we know our implementation was successful? We examine audit standards, feedback metrics, and verification benchmarks designed to maintain quality over prolonged time horizons.`,
      keyTakeaways: [
        'Establish reliable baseline metrics before implementing systemic interventions.',
        'Adopt modular protocols that can be adapted to evolving circumstances.',
        'Continuous auditing prevents gradual decay in operational standards.'
      ]
    },
    {
      title: `Chapter 4: In-Depth Case Studies & Real-World Precedents`,
      originalText: `To validate the efficacy of the proposed frameworks, ${bAuthor} presents exhaustive real-world case studies spanning diverse environments, historical eras, and complex institutional configurations.`,
      englishTranslation: `Practical examination of real-world scenarios where adherence to these principles generated monumental success, and contrasting cases where deviations caused systemic failure.`,
      fullText: `4.1 Case Study A: The Exemplary Implementation\nWe dissect a canonical instance where the precepts of ${bTitle} were applied with exacting discipline. We examine the initial constraints, strategic choices, and the measurable return on effort.\n\n4.2 Case Study B: Anatomy of a Systemic Failure\nStudying failure is often more instructive than studying victory. This case dissects an organization or individual who ignored key tenets, tracing the sequence of cognitive blind spots that triggered collapse.\n\n4.3 Cross-Domain Translation\nHow do principles from ${bCategory} translate into adjacent domains like economics, leadership, technology, and personal mastery? We synthesize cross-disciplinary insights.`,
      keyTakeaways: [
        'Analyze both positive exemplars and negative counter-examples to build balanced judgment.',
        'Recognize the early warning signs of systemic failure before they compound.',
        'Transference of principles across domains unlocks innovative strategic advantages.'
      ]
    },
    {
      title: `Chapter 5: Advanced Paradigms, Edge Cases & Synthesis`,
      originalText: `Moving beyond introductory concepts, Chapter 5 delves into advanced nuances, high-stakes edge cases, and the delicate equilibrium required when core principles appear to come into conflict.`,
      englishTranslation: `An advanced masterclass exploring boundary conditions, non-linear dynamics, and how master practitioners adapt the teachings of ${bAuthor} under extreme pressure.`,
      fullText: `5.1 Navigating Ambiguity & Incomplete Information\nReal-world environments rarely provide pristine data. ${bAuthor} discusses probabilistic reasoning, heuristic adaptation, and maintaining strategic momentum under high uncertainty.\n\n5.2 Resolving Conflicting Principles\nWhat happens when efficiency conflicts with resilience, or short-term demands clash with long-term durability? We explore dynamic equilibrium and contextual prioritization.\n\n5.3 The Psychology of Mastery\nTechnical expertise is insufficient without psychological fortitude. This section addresses emotional regulation, cognitive stamina, and maintaining clarity amidst operational turbulence.`,
      keyTakeaways: [
        'Under conditions of uncertainty, optimize for reversibility and optionality.',
        'Balance competing virtues dynamically rather than rigidly adhering to a single rule.',
        'Emotional discipline is the prerequisite for rigorous analytical execution.'
      ]
    },
    {
      title: `Chapter 6: Practical Implementation & Step-by-Step Roadmap`,
      originalText: `The ultimate value of ${bTitle} is realized through deliberate, continuous application. This chapter outlines a comprehensive 30-60-90 day roadmap for integrating these insights into daily workflows and institutional structures.`,
      englishTranslation: `An actionable tactical blueprint designed for students, researchers, and professionals seeking to internalize the teachings of ${bAuthor}.`,
      fullText: `6.1 Phase 1: Foundation & De-cluttering (Days 1–30)\nEliminate anti-patterns, establish clear metrics, and align team or individual habits with core principles.\n\n6.2 Phase 2: Acceleration & Systematization (Days 31–60)\nAutomate routine procedures, build feedback mechanisms, and stress-test the preliminary models under moderate load.\n\n6.3 Phase 3: Mastery & Long-Term Scaling (Days 61–90+)\nRefine edge cases, cultivate institutional memory, and mentor junior practitioners to ensure enduring cultural permanence.`,
      keyTakeaways: [
        'Follow a phased rollout to prevent cognitive overload and organizational resistance.',
        'Systematize and automate baseline tasks so mental energy is preserved for complex dilemmas.',
        'Institutional memory requires documented standards and continuous mentorship.'
      ]
    },
    {
      title: `Chapter 7: Pitfalls, Misconceptions & Critical Counter-Arguments`,
      originalText: `No intellectual work is immune to misinterpretation. In Chapter 7, ${bAuthor} directly confronts common fallacies, superficial adaptations, and critical counter-arguments raised by contemporary scholars.`,
      englishTranslation: `A rigorous defense and clarification of controversial concepts in ${bTitle}, highlighting subtle distinctions that separate novice understanding from true expertise.`,
      fullText: `7.1 The Top 5 Misconceptions\nWe debunk the most prevalent misunderstandings associated with ${bTitle}, demonstrating how superficial readings overlook vital qualifying clauses and boundary conditions.\n\n7.2 Cargo Cult Implementations\nAdopting the visible rituals of a framework without understanding its underlying rationale leads to catastrophic waste. We analyze how to diagnose and eradicate cosmetic implementations.\n\n7.3 Constructive Critiques & Future Evolution\nWhere do the limitations of ${bAuthor}'s framework lie? We evaluate legitimate scholarly critiques and explore how future practitioners can expand upon the foundations laid here.`,
      keyTakeaways: [
        'Avoid "cargo cult" compliance; understand the underlying principles behind every ritual.',
        'Recognize the boundary conditions where the framework must be modified.',
        'Embrace constructive critique as the engine of intellectual growth.'
      ]
    },
    {
      title: `Chapter 8: Conclusion, Master Synthesis & Annotated Study Guide`,
      originalText: `The concluding chapter brings together all intellectual threads of ${bTitle} into a cohesive, memorable synthesis. ${bAuthor} leaves the reader with timeless wisdom and an inspiring vision for ongoing self-directed scholarship.`,
      englishTranslation: `The ultimate summary and capstone review of ${bTitle}. Features curated study questions, self-assessment rubrics, and recommended reading paths for continuous mastery.`,
      fullText: `8.1 The Grand Synthesis\nA concise, unified recap of the core journey: from foundational axioms and methodological rigor, to practical implementation and defensive safeguards.\n\n8.2 Self-Assessment Rubric\nTen diagnostic questions to test your comprehension and gauge your real-world implementation readiness.\n\n8.3 Final Words from ${bAuthor}\n"Knowledge is not merely a static asset to be acquired, but a living craft to be practiced with humility, precision, and relentless curiosity." Carry these principles forward into your daily pursuits.`,
      keyTakeaways: [
        `You have completed the unabridged digital edition of ${bTitle}.`,
        'Use the self-assessment rubric regularly to evaluate your progress.',
        'Knowledge achieves its highest purpose when combined with deliberate, ethical action.'
      ]
    }
  ];
}
