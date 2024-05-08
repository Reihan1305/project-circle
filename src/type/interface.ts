interface Register {
    fullname: string
    email: string
    password: string
}

interface Login {
    email: string
    password: string
}

interface FollowType {
    id: string;
    follower: FillFollower;
    following: FillFollower;
};

interface FillFollower {
    id: string,
    username: string;
    fullname: string;
    photoprofil: string;
}

interface UserProfileType {
    id: string;
    username: string;
    fullname: string;
    email: string;
    password: null;
    photoprofil: string;
    bio: string;
    created_at: string;
    updated_at: string;
    follower: FollowType[];
    following: FollowType[];
}

interface SearchUserType {
    id: string;
    username: string;
    fullname: string;
    email: string;
    password: null;
    photoprofil: string;
    bio: string | null;
    created_at: string;
    updated_at: string;
}

interface Suggested {
    id: string;
    username: string;
    fullname: string;
    photoprofil: string;
};

interface EditProfileType {
    fullname: string;
    password: string;
    bio: string;
}
interface ThreadPostType {
    content: string;
    image?: File
}

interface ReplyPostType {
    content: string;
    image?: File
    threadId?: string;
}

interface ThreadHomeType {
    id: string;
    content: string;
    image: string;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        username: string;
        fullname: string;
        photoprofil: string;
    };
    likes: ThreadLikeType[];
    replies: {
        length: number
    };
    isLiked: boolean;
}

interface ThreadLikeType {
    id: string;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        username: string;
        fullname: string;
        photoprofil: string;
    };
};

interface ThreadReplyType {
    id: string;
    content: string;
    image: string;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        username: string;
        fullname: string;
        photoprofil: string;
    };
};