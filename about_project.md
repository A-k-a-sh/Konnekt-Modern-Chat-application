This is a real-time chat application built using React, Vite, and Socket.IO. It features user registration, login,(now sudo login) and logout, group creation, group management, and real-time messaging capabilities.


Here user can send one to one message, see one's profile. Can search for users and groups. 

Real time messaging is implemented using Socket.IO.
Real time presence detection is implemented using Socket.IO.



Already chatting user and Joined groups are shownn in the sidebar in two different tabs.

Group has admin and group members. Joined groups are shown in the sidebar. In group , Join members can see each profile.

Can send join request to group.Admin can approve and reject join request. 

User can create groups and add members (with approval of users).


Can Leave groups



In chat, user can send message, delete message, edit message, bulk delete message, reply message, forward message(single and bulk).

can send imges/files in message.
before sending , can see preview of image/file.

can see profile picture of users.
can edit profiles/ set profile .

i didn't use db yet. for replacitcating db i used file alluserinfo allgroupinfo for static data. db will be added later.