let isLoggedIn = false;
let userid;
let isExpandedViewEnabled = false;

window.addEventListener('DOMContentLoaded', async () => {
    await fetchBlogPosts();
});

async function fetchBlogPosts() {
    try {
        //get blog details
        const blogPostResponse = await fetch("/posts/");
        if (!blogPostResponse.ok) {
            throw new Error("Failed to fetch blog posts");
        }

        let blogPosts = await blogPostResponse.json();
        if (!isExpandedViewEnabled){
            blogPosts = blogPosts.slice(0, 2);
        }

        //get author details
        await Promise.all(blogPosts.map(async (blogPost) => {
            const authorResponse = await fetch(`/users/${blogPost.author}`);
            if (!authorResponse.ok) {
                throw new Error("Failed to fetch author details");
            }
            const authData = await authorResponse.json();
            blogPost.authorName = authData.firstName + " " + authData.lastName;
        }));

        //get comment details
        await Promise.all(blogPosts.map(async (blogPost) => {
            await Promise.all(blogPost.comments.map(async (comment) => {
                const userResponse = await fetch(`/users/${comment.user}`);
                if (!userResponse.ok) {
                    throw new Error("Failed to fetch user details");
                }
                const userData = await userResponse.json();
                comment.userName = userData.firstName + " " + userData.lastName;
            }));
        }));

        await displayBlogPost(blogPosts);

    } catch (error) {
        console.error("Failed to fetch content", error.message);
    }
}

//function to display blog posts
async function displayBlogPost(blogPosts) {
    const blogPostContainer = document.getElementById("posts");
    blogPostContainer.innerHTML = "";

    blogPosts.forEach(blogPost => {
        let cardElement = createBlogPostCard(blogPost);
        let postPopup = createBlogPostCard(blogPost, cardElement);
        cardElement = createBlogPostCard(blogPost, postPopup);
        if (isLoggedIn) {
            const commentForm = createCommentForm(blogPost);
            postPopup.appendChild(commentForm);
        }
        cardElement.addEventListener("click", async (event) => {
            if (event.target.classList.contains("like-button") || event.target.classList.contains("like-icon") || event.target.classList.contains("like-count")) {
                return;
            }
            document.getElementById("view-post-popup").style.display = "block";
            document.getElementById("view-post-content").innerHTML="";
            document.getElementById("view-post-content").appendChild(postPopup);

            let postContent = document.getElementById("view-post-content");
            let newPostPopup = document.getElementById("view-post-popup");
            document.body.addEventListener("click", function(event)
            {
                let posts = document.getElementById("posts");
                if (!postContent.contains(event.target) && !posts.contains(event.target)) {
                    newPostPopup.style.display = "none";
                    postContent.innerHTML="";
                }
            });

        });

        blogPostContainer.appendChild(cardElement);
    });

    let loginButton = document.getElementById("login-button");
    let loginPopup =document.getElementById("login-popup");
    let loginContent = document.getElementById("login-content");
    loginButton.addEventListener("click", async () => {loginPopup.style.display = "block";});
    document.body.addEventListener("click", function(event) {
        if (!loginContent.contains(event.target) && event.target !== loginButton) {
            loginPopup.style.display = "none";
        }
    });

    let makePostButton = document.getElementById("make-post-button");
    let makePostPopup =document.getElementById("make-post-popup");
    let makePostContent = document.getElementById("make-post-content");
    makePostButton.addEventListener("click", async () => {makePostPopup.style.display = "block";});
    document.body.addEventListener("click", function(event) {
        if (!makePostContent.contains(event.target) && event.target !== makePostButton) {
            makePostPopup.style.display = "none";
        }
    });
}

setShowMoreButton();

function setShowMoreButton() {
    let showMoreButton = document.getElementById("show-more-button");
    showMoreButton.addEventListener("click", async () => {
        if (!isExpandedViewEnabled) {
            isExpandedViewEnabled = true;
            showMoreButton.innerText = "Show Less";
        } else {
            isExpandedViewEnabled = false;
            showMoreButton.innerText = "Show More";
        }
        await fetchBlogPosts();
    });
}

function createBlogPostCard(blogPost , card) {
    const cardElement = document.createElement("div");
    const titleElement = document.createElement("h3");
    titleElement.textContent = blogPost.title;
    cardElement.appendChild(titleElement);

    const authorElement = document.createElement("p");
    authorElement.textContent = `By: ${blogPost.authorName}`;
    cardElement.appendChild(authorElement);

    const contentElement = document.createElement("p");
    contentElement.textContent = blogPost.content;
    cardElement.appendChild(contentElement);

    const postLikeButton = createLikeElement(blogPost)
    postLikeButton.addEventListener("click", async () => {
        if (blogPost.liked || !isLoggedIn) {
            return;
        }
        try {
            const response = await fetch(`posts/${blogPost._id}/like`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to like post. Try again.");
            }
            blogPost.likes++;
            postLikeButton.querySelector(".like-count").textContent = blogPost.likes;
            blogPost.liked = true;

            const cardLikeButton = card.querySelector(".like-button");
            cardLikeButton.querySelector(".like-count").textContent = blogPost.likes;
        } catch (error){
            console.error("Error", error.message);
        }
    });

    const commentsElement = createCommentElement(blogPost, card);
    cardElement.appendChild(postLikeButton);
    cardElement.appendChild(commentsElement);
    cardElement.classList.add("post");

    return cardElement;
}

function createLikeElement(blogPost) {
    const likeButton = document.createElement("button");
    likeButton.classList.add("like-button");
    const likeCount  = document.createElement("span");
    likeCount.textContent = blogPost.likes;
    likeCount.classList.add("like-count");

    const likeIcon = document.createElement("img");
    likeIcon.classList.add("like-icon");
    likeIcon.src = "/resources/like-icon3.png";
    likeIcon.alt = "like icon"
    likeButton.appendChild(likeIcon);
    likeButton.appendChild(likeCount);

    return likeButton;
}

function createCommentElement(blogPost, card) {
    const commentElement = document.createElement("ul");
    commentElement.classList.add("comment-list");

    blogPost.comments.forEach((comment, index) => {
        const commentItem = document.createElement("li");
        //const userIcon = document.createElement("img");
        const content= document.createElement("span");
        content.textContent = `${comment.userName} : ${comment.text}`;
        content.classList.add("comment-item");
        commentItem.id = "comment-item-" + index;

        const likeButton = createLikeElement(comment);
        commentItem.appendChild(content);
        commentItem.appendChild(likeButton);
        commentElement.appendChild(commentItem);

        likeButton.addEventListener("click", async () => {
            if (comment.liked || !isLoggedIn) {
                return;
            }
            try {
                const response = await fetch(`comments/${blogPost.comments.at(index)._id}/like`, {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                });

                if (!response.ok) {
                    throw new Error("Failed to like comment. Try again.");
                }
                comment.likes++;
                likeButton.querySelector(".like-count").textContent = comment.likes;
                comment.liked = true;

                const cardLikeButton = card.querySelector(`#comment-item-${index} .like-button`);
                cardLikeButton.querySelector(".like-count").textContent = comment.likes;
            } catch (error){
                console.error("Error", error.message);
            }
        });
    });

    return commentElement;

}

function createCommentForm(blogPost) {
    const commentForm = document.createElement("form");
    commentForm.classList.add("comment-form");

    const commentTextArea = document.createElement("textarea");
    commentTextArea.setAttribute("placeholder", "Enter a comment...");
    commentTextArea.setAttribute("name", "comment-text");
    commentTextArea.setAttribute("rows", "5");
    commentTextArea.required = true;
    commentForm.appendChild(commentTextArea)

    const submitButton = document.createElement("button");
    commentTextArea.setAttribute("type", "submit");
    submitButton.textContent = "Submit";
    commentForm.appendChild(submitButton);

    commentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!isLoggedIn) {
            console.log("Unable to comment. Not logged in.");
            return;
        }

        const formData = new FormData(commentForm);
        const commentContent = formData.get("comment-text");

        try {
            const response = await fetch(`posts/${blogPost._id}/comment`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({text: commentContent, user: blogPost.author}),
            });

            if (!response.ok) {
                throw new Error("Failed to add comment. Try again.");
            }

            commentForm.reset();
            console.log("Comment successfully added.");
            document.getElementById("view-post-popup").style.display = "none";
            await fetchBlogPosts();

        } catch (error){
            console.error("Error", error.message);
        }

    });
    return commentForm;
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch(`/users/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password})
        });

        if (!response.ok) {
            throw new Error("Login failed. Try again.");
        }

        const data = await response.json();
        userid = data._id;
        isLoggedIn = true;


        document.getElementById("login-popup").style.display = "none";
        document.getElementById("login-button").hidden = true;
        document.getElementById("make-post-button").hidden = false;

        console.log("Logged in successfully", data);
        document.getElementById("login-as-message").innerText = `Logged in as: [${data.username}]`;
        await fetchBlogPosts();

    } catch (error) {
        console.error("Error:", error.message);
        document.getElementById("login-error-bar").innerText = error.message;

    } finally {
        event.target.reset();
    }
});

document.getElementById("post-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const title = formData.get("post-title");
    const content = formData.get("post-text");

    try {
        const response = await fetch(`/posts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title, content, author: userid})
        });

        if (!response.ok) {
            throw new Error("Failed to create blog post. Try again.");
        }

        event.target.reset();

        await fetchBlogPosts();
        console.log("Post created successfully");


    } catch (error) {
        console.error("Error:", error.message);
        document.getElementById("post-error-bar").innerText = error.message;

    }
    document.getElementById("make-post-popup").style.display = "none";
});