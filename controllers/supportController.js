// controllers/supportController.js

exports.getSupportPage = (req, res) => {
  // ตัวอย่างข้อมูล 5 ท่า
  const exercises = [
    {
      id: 'squat',
      name: 'Squat',
      image: '/image/squat.png',
      description: 'บริหารขาและสะโพก',
    },
    {
      id: 'push-up',
      name: 'Push-up',
      image: '/image/push-up.png',
      description: 'บริหารหน้าอก แขน และแกนกลางลำตัว',
    },
    {
      id: 'plank',
      name: 'Plank',
      image: '/image/plank.png',
      description: 'เน้นความแข็งแรงของแกนกลางลำตัว',
    },
    {
      id: 'jumping-jack',
      name: 'JumpingJack',
      image: '/image/jumping-jacks.png',
      description: 'บริหารหัวใจและกล้ามเนื้อหลายส่วน',
    },
    {
      id: 'bridge',
      name: 'Bridge',
      image: '/image/bridge.png',
      description: 'บริหารหลังส่วนล่างและสะโพก',
    },
  ];

  // ส่งข้อมูล exercises ไปยังไฟล์ EJS ชื่อ 'support'
  res.render('support', { exercises });
};
