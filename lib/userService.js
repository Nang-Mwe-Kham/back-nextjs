import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

const DB_NAME = process.env.MONGODB_DB || 'user';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'user';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

const INITIAL_USERS = [
  {
    id: 'usr_1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acmecorp.io',
    role: 'Admin',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-03-15',
    lastActive: '5 minutes ago',
    phone: '+1 (555) 234-8901',
    location: 'San Francisco, CA',
    bio: 'Lead Platform Architect overseeing distributed cloud infrastructure and identity management.'
  },
  {
    id: 'usr_2',
    name: 'Alex Rivera',
    email: 'alex.rivera@acmecorp.io',
    role: 'Product Manager',
    department: 'Product',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-06-20',
    lastActive: '22 minutes ago',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    bio: 'Product lead directing core customer lifecycle workflows and analytics instrumentation.'
  },
  {
    id: 'usr_3',
    name: 'Elena Rostova',
    email: 'elena.rostova@acmecorp.io',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-08-11',
    lastActive: '1 hour ago',
    phone: '+1 (555) 789-0123',
    location: 'New York, NY',
    bio: 'Full-stack software engineer focusing on high-concurrency microservices and real-time APIs.'
  },
  {
    id: 'usr_4',
    name: 'Marcus Chen',
    email: 'marcus.chen@acmecorp.io',
    role: 'UX Designer',
    department: 'Design',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-01-14',
    lastActive: 'Invited 2 days ago',
    phone: '+1 (555) 321-6548',
    location: 'Seattle, WA',
    bio: 'Design systems lead passionate about accessible, micro-animated user interfaces.'
  },
  {
    id: 'usr_5',
    name: 'Priya Sharma',
    email: 'priya.sharma@acmecorp.io',
    role: 'Support Specialist',
    department: 'Support',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-11-02',
    lastActive: '3 hours ago',
    phone: '+1 (555) 876-5432',
    location: 'Toronto, Canada',
    bio: 'Customer success advocate specialized in enterprise onboardings and SLA incident management.'
  },
  {
    id: 'usr_6',
    name: 'Liam Vance',
    email: 'liam.vance@acmecorp.io',
    role: 'Developer',
    department: 'Engineering',
    status: 'Suspended',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2022-09-18',
    lastActive: '14 days ago',
    phone: '+1 (555) 654-9870',
    location: 'Denver, CO',
    bio: 'Backend integration engineer on temporary security review hold.'
  },
  {
    id: 'usr_7',
    name: 'Hannah Abbott',
    email: 'hannah.abbott@acmecorp.io',
    role: 'Marketing Lead',
    department: 'Marketing',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-04-05',
    lastActive: '45 minutes ago',
    phone: '+1 (555) 901-2345',
    location: 'Chicago, IL',
    bio: 'Growth strategist managing acquisition funnels, retention loops, and brand assets.'
  },
  {
    id: 'usr_8',
    name: 'David Kim',
    email: 'david.kim@acmecorp.io',
    role: 'Admin',
    department: 'Operations',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2022-01-10',
    lastActive: 'Just now',
    phone: '+1 (555) 345-6789',
    location: 'Los Angeles, CA',
    bio: 'IT Director & Security Compliance Officer overseeing SOC2 compliance and IAM policies.'
  }
];

function getFileUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return INITIAL_USERS;
}

function saveFileBackup(users) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Backup file save warning:', e.message);
  }
}

// Connect to MongoDB Atlas (Database: user, Collection: user)
async function getMongoCollection() {
  if (!clientPromise) return null;
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
}

// Convert Mongo document to clean API user object
function formatMongoDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: rest.id || _id.toString(),
    ...rest,
    _mongoId: _id.toString(),
  };
}

// Initial Sync / Seeding if MongoDB collection is empty
async function ensureMongoInitialized(collection) {
  try {
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log(`Syncing initial users into MongoDB Atlas [${DB_NAME}.${COLLECTION_NAME}]...`);
      const seedData = getFileUsers();
      // Remove any existing _id to avoid collision
      const docsToInsert = seedData.map(u => {
        const { _id, ...clean } = u;
        return clean;
      });
      await collection.insertMany(docsToInsert);
      console.log(`Synced ${docsToInsert.length} documents into MongoDB Atlas!`);
    }
  } catch (err) {
    console.warn('Error checking/syncing MongoDB collection:', err.message);
  }
}

/**
 * 1. READ ALL USERS (with optional search, role, department, status filtering)
 */
export async function getUsersList({ search = '', role = '', department = '', status = '' } = {}) {
  const collection = await getMongoCollection();

  if (collection) {
    await ensureMongoInitialized(collection);

    const query = {};
    if (role && role !== 'ALL') query.role = role;
    if (department && department !== 'ALL') query.department = department;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await collection.find(query).sort({ _id: -1 }).toArray();
    const formatted = docs.map(formatMongoDoc);
    saveFileBackup(formatted);
    return formatted;
  }

  // Local fallback if MongoDB is not reachable
  const fileUsers = getFileUsers();
  return fileUsers.filter(u => {
    if (role && role !== 'ALL' && u.role !== role) return false;
    if (department && department !== 'ALL' && u.department !== department) return false;
    if (status && status !== 'ALL' && u.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

/**
 * 2. READ SINGLE USER BY ID
 */
export async function getUserById(id) {
  const collection = await getMongoCollection();

  if (collection) {
    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }
    const doc = await collection.findOne(query);
    return formatMongoDoc(doc);
  }

  const fileUsers = getFileUsers();
  return fileUsers.find(u => u.id === id) || null;
}

/**
 * 3. CREATE USER
 */
export async function createUser(data) {
  const newUser = {
    ...data,
    id: data.id || `usr_${Date.now()}`,
    joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
    lastActive: data.lastActive || 'Just now',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const collection = await getMongoCollection();
  if (collection) {
    const insertRes = await collection.insertOne(newUser);
    const created = {
      ...newUser,
      _mongoId: insertRes.insertedId.toString(),
    };
    console.log(`Created user in MongoDB Atlas [${DB_NAME}.${COLLECTION_NAME}]:`, created.name, created.id);
    return created;
  }

  const fileUsers = getFileUsers();
  fileUsers.unshift(newUser);
  saveFileBackup(fileUsers);
  return newUser;
}

/**
 * 4. UPDATE USER
 */
export async function updateUser(id, updateData) {
  const collection = await getMongoCollection();

  if (collection) {
    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }

    const { _id, id: forbiddenId, ...safeUpdates } = updateData;
    safeUpdates.updatedAt = new Date();

    const res = await collection.findOneAndUpdate(
      query,
      { $set: safeUpdates },
      { returnDocument: 'after' }
    );

    if (res) {
      console.log(`Updated user in MongoDB Atlas:`, id);
      return formatMongoDoc(res);
    }
    return null;
  }

  const fileUsers = getFileUsers();
  const index = fileUsers.findIndex(u => u.id === id);
  if (index === -1) return null;
  fileUsers[index] = { ...fileUsers[index], ...updateData };
  saveFileBackup(fileUsers);
  return fileUsers[index];
}

/**
 * 5. DELETE USER
 */
export async function deleteUser(id) {
  const collection = await getMongoCollection();

  if (collection) {
    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ id }, { _id: new ObjectId(id) }] };
    }
    const res = await collection.deleteOne(query);
    console.log(`Deleted user from MongoDB Atlas:`, id, `(deletedCount: ${res.deletedCount})`);
    return { success: true, id, deletedCount: res.deletedCount };
  }

  const fileUsers = getFileUsers();
  const filtered = fileUsers.filter(u => u.id !== id);
  saveFileBackup(filtered);
  return { success: true, id };
}

/**
 * 6. BULK STATUS UPDATE
 */
export async function bulkUpdateStatus(ids, status) {
  const collection = await getMongoCollection();

  if (collection) {
    const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    const query = {
      $or: [
        { id: { $in: ids } },
        ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : [])
      ]
    };

    const res = await collection.updateMany(
      query,
      { $set: { status, updatedAt: new Date() } }
    );
    console.log(`Bulk updated status in MongoDB Atlas:`, res.modifiedCount, 'documents');
    return { success: true, count: res.modifiedCount, status };
  }

  const fileUsers = getFileUsers();
  const updated = fileUsers.map(u => ids.includes(u.id) ? { ...u, status } : u);
  saveFileBackup(updated);
  return { success: true, count: ids.length, status };
}

/**
 * 7. BULK DELETE
 */
export async function bulkDeleteUsers(ids) {
  const collection = await getMongoCollection();

  if (collection) {
    const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    const query = {
      $or: [
        { id: { $in: ids } },
        ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : [])
      ]
    };

    const res = await collection.deleteMany(query);
    console.log(`Bulk deleted from MongoDB Atlas:`, res.deletedCount, 'documents');
    return { success: true, count: res.deletedCount };
  }

  const fileUsers = getFileUsers();
  const filtered = fileUsers.filter(u => !ids.includes(u.id));
  saveFileBackup(filtered);
  return { success: true, count: ids.length };
}

/**
 * 8. RESET / SEED
 */
export async function resetToSeed() {
  const collection = await getMongoCollection();

  if (collection) {
    await collection.deleteMany({});
    const docs = INITIAL_USERS.map(u => {
      const { _id, ...clean } = u;
      return { ...clean, createdAt: new Date() };
    });
    await collection.insertMany(docs);
    console.log(`Reset and re-seeded ${docs.length} users in MongoDB Atlas [${DB_NAME}.${COLLECTION_NAME}]`);
    const seeded = await collection.find({}).toArray();
    return seeded.map(formatMongoDoc);
  }

  saveFileBackup(INITIAL_USERS);
  return INITIAL_USERS;
}
