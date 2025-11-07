


allGroupsData = [
    {
        groupId: 1,
        groupName: "Group 1",
        adminId: "A",
        groupImage: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg",
        groupMembers: [
            { userId: "A", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "C", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "D", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
        ],

        groupJoinRequests: [
            { userId: "B", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "E", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "F", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
        ]
    },

    {
        groupId: 2,
        groupName: "Group 2",
        adminId: "C",
        groupImage: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?q=80&w=2267&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        groupMembers: [
            { userId: "B", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "C", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "E", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
        ],

        groupJoinRequests: [
            { userId: "D", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "F", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },

        ]
    },



    {
        groupId: 3,
        groupName: "Group 3",
        adminId: "A",
        groupImage: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?q=80&w=2267&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        groupMembers: [
            { userId: "A", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "C", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "E", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
        ],

        groupJoinRequests: [
            //B wants to join
            { userId: "D", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },
            { userId: "F", image: "https://www.shutterstock.com/image-photo/awesome-pic-natureza-600nw-2408133899.jpg" },

        ]
    }
]


module.exports = allGroupsData;