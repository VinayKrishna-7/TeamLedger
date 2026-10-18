import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Group } from './models/Group.js';
import { Expense } from './models/Expense.js';
import { Settlement } from './models/Settlement.js';

dotenv.config();

const reset = async () => {
  await connectDB();
  await Group.deleteMany({});
  await Expense.deleteMany({});
  await Settlement.deleteMany({});
  console.log('Database reset complete.');
  process.exit(0);
};

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
