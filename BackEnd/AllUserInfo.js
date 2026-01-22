
const allUserInfo = [
    {
        userId: 1,
        userName: "Akash",
        email: "akash@example.com",
        bio: "Fullstack Developer | Tech Enthusiast",
        image: "https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop",
        connected_to: [
            { userId: 2, userName: "B", image: "https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop" },
            { userId: 3, userName: "C", image: "https://images.unsplash.com/photo-1622976480059-1e341a28786e?q=80&w=3087&auto=format&fit=crop" }
        ],
        joined_groups: [1, 2]
    },
    {
        userId: 2,
        userName: "B", // Using simple names as requested or implied for testing
        email: "b@example.com",
        bio: "Loves coding and coffee ☕",
        image: "https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop",
        connected_to: [
            { userId: 1, userName: "Akash", image: "https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop" },
            { userId: 4, userName: "D", image: "https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop" }
        ],
        joined_groups: [1, 2, 3]
    },
    {
        userId: 3,
        userName: "C",
        email: "c@example.com",
        bio: "Designer 🎨",
        image: "https://images.unsplash.com/photo-1622976480059-1e341a28786e?q=80&w=3087&auto=format&fit=crop",
        connected_to: [
            { userId: 1, userName: "Akash", image: "https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop" }
        ],
        joined_groups: [1, 2]
    },
    {
        userId: 4,
        userName: "D",
        email: "d@example.com",
        bio: "Backend Wizard 🧙‍♂️",
        image: "https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop",
        connected_to: [
            { userId: 2, userName: "B", image: "https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop" }
        ],
        joined_groups: [] // Not in Group 1 or 2 initially
    },
    {
        userId: 5,
        userName: "E",
        email: "e@example.com",
        bio: "Frontend Ninja 🥷",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop",
        connected_to: [],
        joined_groups: []
    }
];

module.exports = allUserInfo;