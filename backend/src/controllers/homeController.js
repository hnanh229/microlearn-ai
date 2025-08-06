const homePageData = {
  quotes: [
    {
      id: 'quote-1',
      text: "Microlearning makes learning more digestible, engaging, and effective.",
      author: "Learning Expert"
    },
    {
      id: 'quote-2',
      text: "Small steps lead to big achievements in learning.",
      author: "Education Innovator"
    },
    {
      id: 'quote-3',
      text: "The best learning happens in short, focused bursts.",
      author: "Cognitive Scientist"
    }
  ],
  featuredCourses: [
    {
      id: 'course-1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of web development through bite-sized lessons.',
      imageUrl: '/courses/web-dev.jpg'
    },
    {
      id: 'course-2',
      title: 'Data Science Fundamentals',
      description: 'Master the core concepts of data science in small, manageable steps.',
      imageUrl: '/courses/data-science.jpg'
    },
    {
      id: 'course-3',
      title: 'Mobile App Development',
      description: 'Create your first mobile app through focused, practical lessons.',
      imageUrl: '/courses/mobile-dev.jpg'
    }
  ]
};

const getHomePageData = async (req, res) => {
  try {
    res.json(homePageData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching homepage data' });
  }
};

module.exports = {
  getHomePageData
};
