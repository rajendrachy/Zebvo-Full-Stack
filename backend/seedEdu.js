import mongoose from 'mongoose';
import Post from './models/Post.js';
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zebvo';

async function run() {
  await mongoose.connect(URI);
  console.log("Connected to DB");

  const posts = [
    {
      id: 'post_class12_' + Date.now(),
      platform: 'YouTube',
      author: 'NepalEducationBoard',
      authorName: 'NEB Official',
      text: 'NEB Class 12 Results are officially out! Check your results online and watch our official announcement video here: https://www.youtube.com/watch?v=dQw4w9WgXcQ Best of luck to all the students! #Class12Nepal #NEB',
      region: 'Nepal',
      likes: 1200,
      shares: 450,
      comments: 320,
      timestamp: new Date(),
      language: 'English',
      sentiment: 'Positive',
      category: 'General',
      summary: 'NEB Class 12 Results announced officially.',
      isGibberish: false,
      authorAvatar: 'https://ui-avatars.com/api/?name=NEB&background=0D8ABC&color=fff',
      postImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80',
      postVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    },
    {
      id: 'post_class10_' + Date.now(),
      platform: 'YouTube',
      author: 'SEENepal',
      authorName: 'SEE Board Nepal',
      text: 'Class 10 SEE Examination Routine has been published. Prepare well! Watch our preparation guide: https://www.youtube.com/watch?v=kJQP7kiw5Fk #Class10Nepal #SEE',
      region: 'Nepal',
      likes: 3400,
      shares: 1200,
      comments: 500,
      timestamp: new Date(Date.now() - 3600000),
      language: 'English',
      sentiment: 'Positive',
      category: 'General',
      summary: 'Class 10 SEE Routine Published.',
      isGibberish: false,
      authorAvatar: 'https://ui-avatars.com/api/?name=SEE&background=0D8ABC&color=fff',
      postImage: '',
      postVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    },
    {
      id: 'post_class8_' + Date.now(),
      platform: 'Facebook',
      author: 'BLE_Updates',
      authorName: 'BLE Nepal',
      text: 'Class 8 BLE (Basic Level Examination) updates: The local level exams will begin next month. Make sure to review the syllabus. Here is a helpful video for students: https://www.youtube.com/watch?v=9bZkp7q19f0 #Class8Nepal #BLE',
      region: 'Nepal',
      likes: 800,
      shares: 150,
      comments: 40,
      timestamp: new Date(Date.now() - 7200000),
      language: 'English',
      sentiment: 'Neutral',
      category: 'General',
      summary: 'Class 8 BLE updates and exam schedules.',
      isGibberish: false,
      authorAvatar: 'https://ui-avatars.com/api/?name=BLE&background=0D8ABC&color=fff',
      postImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80',
      postVideo: ''
    }
  ];

  await Post.insertMany(posts);
  console.log("Inserted 3 posts.");
  process.exit(0);
}

run();
