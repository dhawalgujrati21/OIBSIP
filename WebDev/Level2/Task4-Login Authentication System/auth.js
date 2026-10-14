const USERS_KEY = "authDemoUsers";
const SESSION_KEY = "authDemoSession";

function getUsers() {
    try {
        const data = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

async function hashPassword(password) {
    const bytes = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", bytes);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

function showMessage(text, type) {
    const message = document.getElementById("message");

    if (!message) return;

    message.textContent = text;
    message.className = "message " + type;
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document
            .getElementById("username").value.trim();

        const email = document
            .getElementById("email").value.trim().toLowerCase();

        const password = document
            .getElementById("password").value;

        if (!username || !email || !password) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (username.length < 3 || username.length > 30) {
            showMessage(
                "Username must be between 3 and 30 characters.",
                "error"
            );
            return;
        }

        if (/\s/.test(username)) {
            showMessage("Username cannot contain spaces.", "error");
            return;
        }

        if (password.length < 8 || !/\d/.test(password)) {
            showMessage(
                "Password must contain at least 8 characters and 1 number.",
                "error"
            );
            return;
        }

        if (!crypto.subtle) {
            showMessage(
                "Secure browser cryptography is unavailable. Run this project on localhost.",
                "error"
            );
            return;
        }

        const users = getUsers();

        const duplicate = users.some(user =>
            user.username.toLowerCase() === username.toLowerCase() ||
            user.email.toLowerCase() === email
        );

        if (duplicate) {
            showMessage(
                "That username or email is already registered.",
                "error"
            );
            return;
        }

        try {
            const passwordHash = await hashPassword(password);

            users.push({
                id: crypto.randomUUID(),
                username: username,
                email: email,
                passwordHash: passwordHash
            });

            localStorage.setItem(USERS_KEY, JSON.stringify(users));

            showMessage(
                "Registration successful! Redirecting to login...",
                "success"
            );

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 900);
        } catch (error) {
            showMessage(
                "Registration failed. Please try again.",
                "error"
            );
        }
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const identity = document
            .getElementById("identity").value.trim().toLowerCase();

        const password = document
            .getElementById("password").value;

        if (!identity || !password) {
            showMessage(
                "Please enter your username/email and password.",
                "error"
            );
            return;
        }

        if (!crypto.subtle) {
            showMessage(
                "Secure browser cryptography is unavailable. Run this project on localhost.",
                "error"
            );
            return;
        }

        try {
            const users = getUsers();

            const user = users.find(account =>
                account.username.toLowerCase() === identity ||
                account.email.toLowerCase() === identity
            );

            const passwordHash = await hashPassword(password);

            if (!user || user.passwordHash !== passwordHash) {
                showMessage(
                    "Invalid username/email or password.",
                    "error"
                );
                return;
            }

            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    userId: user.id,
                    username: user.username
                })
            );

            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(
                "Login failed. Please try again.",
                "error"
            );
        }
    });
}

if (window.location.pathname.endsWith("/dashboard.html") ||
    window.location.pathname.endsWith("dashboard.html")) {

    let session = null;

    try {
        session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
        session = null;
    }

    const users = getUsers();

    const currentUser = session && users.find(user =>
        user.id === session.userId
    );

    if (!currentUser) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("login.html");
    } else {
        document.getElementById("welcomeMessage").textContent =
            "Welcome, " + currentUser.username + "!";

        document.getElementById("logoutButton")
            .addEventListener("click", function () {
                sessionStorage.removeItem(SESSION_KEY);
                window.location.replace("login.html");
            });
    }
}