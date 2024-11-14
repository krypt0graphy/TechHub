
const firebaseConfig = {
    apiKey: "AIzaSyC2bSxVO_I8G6QlzAchO-DcKowJ34OR1zY",
    authDomain: "cs-assignment-html.firebaseapp.com",
    databaseURL: "https://cs-assignment-html-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cs-assignment-html",
    storageBucket: "cs-assignment-html.firebasestorage.app",
    messagingSenderId: "299402093754",
    appId: "1:299402093754:web:1b13f0245267c5a8164e83"
};

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized:", firebase.apps.length > 0);
const db = firebase.firestore();

async function getLatestPosts() {

    try {
        const querySnapshot = await db.collection('Blogposts')
            .orderBy('date', 'desc')
            .limit(3)
            .get();

        console.log("Documents fetched:", querySnapshot.size);
        const posts = querySnapshot.docs.map(doc => doc.data());

        console.log("Fetched Posts:", posts); // Debugging: Check the posts array

        posts.forEach((post, index) => {
            console.log(`Post ${index + 1}:`, post);  // Log post data
            console.log("Index:", index); // Log the index to confirm it's working

            const imgElem = document.getElementById(`post-image-${index + 1}`);
            const titleElem = document.getElementById(`post-title-${index + 1}`);
            const dateElem = document.getElementById(`post-date-${index + 1}`);

            console.log("Image Element:", imgElem);
            console.log("Title Element:", titleElem);
            console.log("Date Element:", dateElem);

            if (imgElem) imgElem.src = post.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1022px-Placeholder_view_vector.svg.png?20220519031949';
            if (titleElem) titleElem.textContent = post.title || 'No Title';
            if (dateElem) dateElem.textContent = post.date.toDate().toLocaleDateString()|| 'No Date';

            const postDiv = document.getElementById(`latest-post-${index + 1}`);
            postDiv.addEventListener('click', () => {
                window.location.href = `posts.html?postId=${post.id}`;
            })
        });
    } catch (error) {
        console.error("Error fetching posts: ", error);
    }

}


async function populateList() {
    try {
        const querySnapshot = await db.collection('Blogposts')
            .orderBy('date', 'desc')
            .get();

        const postList = document.getElementById('posts-list')

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            const postTitle = document.createElement('span')
            const postDate = document.createElement('span')

            postTitle.textContent = post.title;
            postDate.textContent = post.date.toDate().toLocaleDateString();
            postTitle.classList.add('post-title');
            postDate.classList.add('post-date');

            link.href = "#";
            link.setAttribute('data-id', post.id);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (document.getElementById('post-image')) {
                    document.getElementById('post-image').remove();
                }
                window.location.href = `posts.html?postId=${post.id}`;
                displayPostById(post.id);
            });

            link.appendChild(postTitle);
            link.appendChild(document.createElement('br'))
            link.appendChild(postDate)
            listItem.appendChild(link);
            postList.appendChild(listItem)

        });
    } catch (error) {
        console.error('Error populating list', error)
    }

}

async function displayPostById(postId) {
    try {
        const selectedPost = await db.collection('Blogposts')
            .where('id', '==', postId)
            .get();

        const doc = selectedPost.docs[0];

        if (!selectedPost.empty) {
            const post = doc.data();

            document.getElementById('post-title').textContent = post.title || 'No Title';
            document.getElementById('post-date').textContent = post.date ? post.date.toDate().toLocaleDateString() : 'No Date';
            let postContent = post.content.replaceAll('\\n', '<br>');
            document.getElementById('content').innerHTML = postContent|| 'No Content Available';
            const selectedPostDiv = document.getElementById('selected-post');

            if (post.image) {
                const imgElem = document.createElement('img');
                imgElem.id = 'post-image';
                imgElem.src = post.image;
                selectedPostDiv.appendChild(imgElem);
            }

            selectedPostDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.log('No post found!');
        }
    } catch (error) {
        console.error("Error fetching post by ID:", error);
    }
}


function clearComment() {
    location.reload()
    author = '';
    commentBody = '';
}


async function submitComment() {
    /* new doc with ID CXX, author, current date, comment body*/
    const author = document.getElementById("author").value;
    const commentBody = document.getElementById("commentbox").value;
    const date = new Date().toLocaleDateString()

    const commentsRef = db.collection('GeneralComments');
    const latestDoc = await commentsRef.orderBy('id', 'desc').limit(1).get();

    let newId;
    if (!latestDoc.empty) {
        const lastId = latestDoc.docs[0].id;
        const lastNum = parseInt(lastId.replace('C', ''), 10);
        newId = 'C' + String(lastNum + 1).padStart(2, '0');
        console.log(newId)

    } else {
        newId="C01"
        console.log(newId)
    }

    await commentsRef.doc(newId).set({
        author: author,
        date: date,
        comment: commentBody,
        id: newId
    });

    alert("Comment submitted!");
    clearComment();

}

async function displayComments() {
    const commentList = document.getElementById('commentlist');
    commentList.innerHTML = '';

    const commentsQuery = await db.collection('GeneralComments').get();
    const displayOrder = commentsQuery.docs.reverse();

    displayOrder.forEach((doc) => {
        const commentDoc = doc.data();

        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.id = commentDoc.id;

        const blockquote = document.createElement('blockquote');

        const authorSpan = document.createElement('span');
        authorSpan.className = 'author';
        authorSpan.textContent = commentDoc.author.trimEnd();

        const dateSpan = document.createElement('span');
        dateSpan.className = 'date'
        dateSpan.textContent = commentDoc.date;

        const commentBody = document.createElement('p');
        commentBody.className = 'commentbody';
        commentBody.textContent = commentDoc.comment;

        blockquote.appendChild(authorSpan);
        blockquote.appendChild(dateSpan);
        blockquote.appendChild(commentBody);

        commentDiv.appendChild(blockquote);
        document.getElementById('commentlist').appendChild(commentDiv);
    });

}

function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('postId');
}

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page')
    const postId = getPostIdFromUrl();

    if (page == 'posts') {
        populateList()
    }
    if (page == 'index') {
        getLatestPosts();
        document.getElementById('submit').addEventListener('click', submitComment);
        displayComments();
    }
    if (postId) {
        displayPostById(postId);
    }
});