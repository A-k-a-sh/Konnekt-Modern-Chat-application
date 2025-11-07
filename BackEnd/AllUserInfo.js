//this is db

const AllUserInfo = [
    {
        userId : 1,
        userName : "A",
        email : "a@email.com",
        password : "12345678",
        profilePhoto : 'https://images.unsplash.com/photo-1520531158340-44015069e78e?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        bio : '',
        connected_to : [ 2 , 3, 4],
        block_to : [3 , 4],
        joined_groups : [1 , 2 , 3],

    },
    {
        userId : 2,
        userName : "B",
        email : "b@email.com",
        password : "12345678",
        profilePhoto : 'https://images.unsplash.com/photo-1631555641489-e9b5f52d3e1f?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        bio : '',
        connected_to : [1  , 3],
        block_to : [4 , 5],
        joined_groups : [1 , 3],
    },
    {
        userId : 3,
        userName : "C",
        email : "c@email.com",
        password : "12345678",
        profilePhoto :'https://images.unsplash.com/photo-1622976480059-1e341a28786e?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        bio : '',
        connected_to : [1 , 2 , 5 , 1 , 2 , 5 ,1 , 2 , 5 ,1 , 2 , 5 ,2 , 5 ,1 , 2 , 5 ,1 , 2 , 5 ,],
        block_to : [3 , 4],
        joined_groups : [1 , 2 , 3],
    },
    {
        userId : 4,
        userName : "D",
        email : "d@email.com",
        password : "12345678",
        profilePhoto : 'https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        bio : '',
        connected_to : [1 , 2 , 3],
        block_to : [4 , 5],
        joined_groups : [1 , 3],
    },

    {
        userId : 5,
        userName : "E",
        email : "e@email.com",
        password : "12345678",
        profilePhoto : 'https://images.unsplash.com/photo-1628498188873-579210ce622e?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        bio : '',
        connected_to : [1 , 2 , 3],
        block_to : [4 , 5],
        joined_groups : [1 , 3],
    }
]


module.exports = AllUserInfo