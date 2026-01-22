
const allGroupsData = [
    {
        groupId: 1,
        groupName: "Code Warriors",
        adminId: 1, // Akash
        groupImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop",
        description: "A group for coding enthusiasts to share knowledge and projects.",
        groupMembers: [
            {
                userId: 1,
                userName: "Akash",
                email: "akash@example.com",
                bio: "Fullstack Developer | Tech Enthusiast",
                image: "https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop"
            },
            {
                userId: 2,
                userName: "B",
                email: "b@example.com",
                bio: "Loves coding and coffee ☕",
                image: "https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop"
            },
            {
                userId: 3,
                userName: "C",
                email: "c@example.com",
                bio: "Designer 🎨",
                image: "https://images.unsplash.com/photo-1622976480059-1e341a28786e?q=80&w=3087&auto=format&fit=crop"
            }
        ],
        groupJoinRequests: [
            {
                userId: 4,
                userName: "D",
                email: "d@example.com",
                image: "https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop"
            }
        ]
    },
    {
        groupId: 2,
        groupName: "Design Heads",
        adminId: 3, // C
        groupImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop",
        description: "Creative minds discussing UI/UX and visual design.",
        groupMembers: [
            {
                userId: 1,
                userName: "Akash",
                email: "akash@example.com",
                bio: "Fullstack Developer | Tech Enthusiast",
                image: "https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop"
            },
            {
                userId: 3,
                userName: "C",
                email: "c@example.com",
                bio: "Designer 🎨",
                image: "https://images.unsplash.com/photo-1622976480059-1e341a28786e?q=80&w=3087&auto=format&fit=crop"
            },
            {
                userId: 2,
                userName: "B",
                email: "b@example.com",
                bio: "Loves coding and coffee ☕",
                image: "https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop"
            }
        ],
        groupJoinRequests: []
    },
    {
        groupId: 3,
        groupName: "Coffee Club",
        adminId: 2, // B
        groupImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop",
        description: "Casual chats and chill vibes.",
        groupMembers: [
            {
                userId: 2,
                userName: "B",
                email: "b@example.com",
                bio: "Loves coding and coffee ☕",
                image: "https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop"
            }
        ],
        groupJoinRequests: [
            {
                userId: 1,
                userName: "Akash",
                email: "akash@example.com",
                image: "https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop"
            },
            {
                userId: 4,
                userName: "D",
                email: "d@example.com",
                image: "https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop"
            }
        ]
    }
];

module.exports = allGroupsData;