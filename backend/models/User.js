import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  preferredCategories: [{ type: String }],
  readingCalendar: [{ date: String, completed: Boolean }],
  books: [{ title: String, author: String, url: String, totalMinutes: Number, readMinutes: Number }],
  todos: [{ text: String, done: Boolean, dueDate: Date, createdAt: Date }]
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
export default User;
