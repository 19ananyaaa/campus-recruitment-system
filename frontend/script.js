// ====== CORE CONSTANTS & SETTINGS ======
const API_BASE_URL = "http://localhost/Campus/backend/"; 
let globalOpportunities = []; 
let globalApplications = []; 
let globalMyEvents = []; // Tracking array for enrollment states
let globalAdminJobs = []; // Tracking array for admin job editing

// ====== SYSTEM WIDE UI MANAGERS ======

function switchSection(sectionId, navElement) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`section-${sectionId}`).classList.add('active');
    
    if(navElement) {
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => link.classList.remove('active'));
        navElement.classList.add('active'); 
    }
    document.getElementById('sidebar').classList.remove('open');
}

const sidebarToggle = document.getElementById('sidebarToggle');
if(sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

function showNotification(messageHtml) {
    const pop = document.getElementById("notificationPopup");
    const msg = document.getElementById("notificationMsg");
    if(pop && msg) {
        msg.innerHTML = messageHtml;
        pop.classList.add("show");
    }
}
function closeNotification() {
    document.getElementById("notificationPopup").classList.remove("show");
}

function showAlert(elementId, type, message) {
    const alertBox = document.getElementById(elementId);
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} alert-dismissible fade show`;
    alertBox.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    alertBox.classList.remove("d-none");
    setTimeout(() => alertBox.classList.add("d-none"), 4000);
}

// Global SaaS Toast Logic
function showSaasToast(messageHtml) {
    const container = document.getElementById("toastContainer");
    if(!container) return; 
    
    const toast = document.createElement("div");
    toast.className = "saas-toast";
    toast.innerHTML = messageHtml;
    container.appendChild(toast);
    
    setTimeout(() => { toast.classList.add("show"); }, 30);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400); 
    }, 4500);
}

/* Step: UI ko user-friendly banane ke liye label update kar rahe hain */
function updateDarkModeBtn(isDark) {
    const isDashboardOrAdmin = document.getElementById("darkModeBtn") && document.getElementById("darkModeBtn").classList.contains("btn-outline-secondary");
    if(isDark) {
        document.querySelectorAll("#darkModeBtn").forEach(btn => btn.innerHTML = isDashboardOrAdmin ? `<i class="bi bi-brightness-high"></i> Disable Dark Mode` : `<i class="bi bi-brightness-high"></i> Disable Dark Mode`);
    } else {
        document.querySelectorAll("#darkModeBtn").forEach(btn => btn.innerHTML = isDashboardOrAdmin ? `<i class="bi bi-moon"></i> Enable Dark Mode` : `<i class="bi bi-moon"></i> Enable Dark Mode`);
    }
}

const darkModeBtn = document.getElementById("darkModeBtn");
if (darkModeBtn) {
    updateDarkModeBtn(document.body.classList.contains("dark-mode"));
    darkModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
        updateDarkModeBtn(isDark);
    });
}

const logoutBtn = document.getElementById("logoutBtn");
const logoutBtnTop = document.getElementById("logoutBtnTop");

function executeLogout() { localStorage.clear(); window.location.href = "index.html"; }
if(logoutBtn) logoutBtn.addEventListener("click", executeLogout);
if(logoutBtnTop) logoutBtnTop.addEventListener("click", executeLogout);

function checkAuth() {
    if (!localStorage.getItem("userEmail")) {
        window.location.href = "index.html"; 
    }
}


// ====== FRONTEND SIGNUP / LOGIN MECHANICS ======

const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        try {
            const response = await fetch(`${API_BASE_URL}signup.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.status === "success") {
                showAlert("signupAlert", "success", "Welcome onboard! Moving bounds setup...");
                setTimeout(() => window.location.href = "index.html", 1500);
            } else { showAlert("signupAlert", "danger", data.message); }
        } catch { showAlert("signupAlert", "danger", "Database server drops."); }
    });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        try {
            const response = await fetch(`${API_BASE_URL}login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (data.status === "success") {
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userRole", data.role);
                showAlert("loginAlert", "success", "Verification secure. Routing...");
                
                setTimeout(() => {
                    if (data.role === "admin") window.location.href = "admin.html";
                    else window.location.href = "dashboard.html";
                }, 1000);
            } else { showAlert("loginAlert", "danger", data.message); }
        } catch { showAlert("loginAlert", "danger", "Core connection failure."); }
    });
}


// ====== STUDENT PLATFORM LOGIC ======

async function loadOpportunities() {
    const list = document.getElementById("opportunitiesList");
    if (!list) return;

    try {
        const res = await fetch(`${API_BASE_URL}get_opportunities.php`);
        const result = await res.json();

        if (result.status === "success") {
            globalOpportunities = result.data;
            let totalOps = document.getElementById("statOpportunities");
            if(totalOps) totalOps.innerText = globalOpportunities.length; 
            renderJobs(globalOpportunities);
            generateRecommendations(); // Fix: Trigger recommendations after opportunities load to avoid race condition
        }
    } catch { list.innerHTML = `<div class="col-12 text-danger text-center">Failed to execute sync.</div>`; }
}

const jsbox = document.getElementById("jobSearch");
const cpbox = document.getElementById("companyFilter");
if(jsbox) jsbox.addEventListener("input", filterJobs);
if(cpbox) cpbox.addEventListener("input", filterJobs);

function filterJobs() {
    const searchWord = document.getElementById("jobSearch") ? document.getElementById("jobSearch").value.toLowerCase() : "";
    const companyWord = document.getElementById("companyFilter") ? document.getElementById("companyFilter").value.toLowerCase() : "";
    
    const filtered = globalOpportunities.filter(job => 
        job.title.toLowerCase().includes(searchWord) && 
        job.company.toLowerCase().includes(companyWord)
    );
    renderJobs(filtered);
}

function renderJobs(jobsArray) {
    const list = document.getElementById("opportunitiesList");
    if (!list) return;
    
    list.innerHTML = "";
    if(jobsArray.length === 0) {
        list.innerHTML = `<div class="col-12 text-center text-muted mt-4">🚀 Start exploring opportunities to unlock recommendations!</div>`;
        return;
    }

    jobsArray.forEach(job => {
        let hasApplied = globalApplications.some(app => app.opportunity_id == job.id);
        
        let typeStr = job.job_type || "Full-time";
        let typeBadge = typeStr.toLowerCase() === "internship" ? "bg-warning text-dark" : (typeStr.toLowerCase() === "remote" ? "bg-info text-dark" : "bg-primary");

        let actionFormHtml = hasApplied ? 
            `<button class="btn btn-secondary fw-bold w-100 disabled shadow-none" style="cursor:not-allowed">✅ Applied</button>` : 
            `<button class="btn btn-primary fw-bold w-100" onclick="openApplyModal(${job.id}, '${job.title} at ${job.company}')">🚀 Apply Now</button>`;

        const card = document.createElement("div");
        card.className = "col-lg-6 mb-4";
        card.innerHTML = `
            <div class="card h-100 shadow-sm border-0 custom-card">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h4 class="card-title fw-bold text-dark mb-1">${job.title}</h4>
                            <h6 class="card-subtitle text-muted"><i class="bi bi-building"></i> ${job.company}</h6>
                        </div>
                        <span class="badge ${typeBadge} border shadow-sm">${typeStr}</span>
                    </div>
                    
                    <div class="d-flex gap-2 mb-3 mt-1 flex-wrap">
                        <span class="badge bg-light text-secondary border"><i class="bi bi-geo-alt"></i> ${job.location || 'Remote'}</span>
                        <span class="badge bg-light text-secondary border"><i class="bi bi-cash-stack"></i> ${job.salary || 'Not Disclosed'}</span>
                    </div>
                    
                    <p class="card-text small mb-2"><strong><i class="bi bi-info-circle text-info"></i> Base Details:</strong><br/>${job.description || 'General role'}</p>
                    <p class="card-text small mb-4"><strong><i class="bi bi-shield-check text-success"></i> Eligibility:</strong><br/>${job.eligibility || 'Check with HR'}</p>
                    
                    <div class="mt-auto pt-3 border-top d-flex justify-content-end">
                        ${actionFormHtml}
                    </div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function openApplyModal(jobId, jobString) {
    document.getElementById("applyJobId").value = jobId;
    document.getElementById("applyJobTitle").value = jobString;
    const applyModal = new bootstrap.Modal(document.getElementById('applyModal'));
    applyModal.show();
}

const applyForm = document.getElementById("applyForm");
if (applyForm) {
    applyForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        
        const jobId = document.getElementById("applyJobId").value;
        const resumeFile = document.getElementById("resumeUpload").files[0];
        const email = localStorage.getItem("userEmail");
        
        let formBuffer = new FormData();
        formBuffer.append("email", email);
        formBuffer.append("opportunity_id", jobId);
        formBuffer.append("resume", resumeFile);
        
        const btn = applyForm.querySelector('button[type="submit"]');
        btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing Upload...`;
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}apply.php`, { method: 'POST', body: formBuffer });
            const data = await res.json();
            
            if (data.status === "success") {
                showSaasToast("✅ Applied Successfully!");
                let modalInstance = bootstrap.Modal.getInstance(document.getElementById('applyModal'));
                modalInstance.hide();
                applyForm.reset();
                loadMyApplications(); 
            } else { showAlert("dashboardAlert", "warning", data.message); }
        } catch (err) { showAlert("dashboardAlert", "danger", "Upload bounds failure.");
        } finally { btn.innerHTML = `Submit Application <i class="bi bi-send-fill ms-1"></i>`; btn.disabled = false; }
    });
}

async function loadMyApplications() {
    const list = document.getElementById("myApplicationsList");
    if (!list) return;
    const email = localStorage.getItem("userEmail");
    
    try {
        const res = await fetch(`${API_BASE_URL}get_applications.php?email=${email}`);
        const result = await res.json();

        if (result.status === "success") {
            globalApplications = result.data;
            list.innerHTML = "";
            generateRecommendations(); 
            if(globalOpportunities.length > 0) renderJobs(globalOpportunities); 
            
            let countApp = 0, countShort = 0, countReject = 0;
            globalApplications.forEach(app => {
                 countApp++;
                 if(app.status === 'Screening' || app.status === 'Interview' || app.status === 'Selected') countShort++;
                 if(app.status === 'Rejected') countReject++;
            });
            const stA = document.getElementById("statApplied");
            if(stA) {
                 stA.innerText = countApp;
                 document.getElementById("statShortlisted").innerText = countShort;
                 document.getElementById("statRejected").innerText = countReject;
            }

            if(globalApplications.length === 0) {
                list.innerHTML = `<div class="col-12 text-center text-muted mt-5"><h5>You haven't applied to any jobs yet 🚀 Start exploring!</h5></div>`;
                return;
            }
            
            globalApplications.forEach(app => {
                 let progressApplied = "completed";
                 let progressShortlisted = app.status === 'Screening' || app.status === 'Interview' || app.status === 'Selected' ? 'completed' : (app.status === 'Rejected' ? 'rejected' : '');
                 let progressSelected = app.status === 'Selected' ? 'completed' : '';
                
                 let interviewBlock = "";
                 if(app.status === 'Interview') {
                     interviewBlock = `
                        <div class="alert alert-success mt-3 mb-0 border shadow-sm" style="background:#f8fff9;">
                            <h6 class="fw-bold mb-2 text-success"><i class="bi bi-calendar-event me-2"></i> Official Interview Setting</h6>
                            <p class="mb-1 small"><strong>Date:</strong> ${app.interview_date} &nbsp;|&nbsp; <strong>Time:</strong> ${app.interview_time}</p>
                            <p class="mb-1 small"><strong>Mode:</strong> ${app.interview_mode}</p>
                            <p class="mb-0 small mt-2 bg-light p-2 border rounded text-muted"><em>"${app.message}"</em></p>
                        </div>
                     `;
                 }

                 const card = document.createElement("div");
                 card.className = "col-lg-12 mb-4";
                 card.innerHTML = `
                    <div class="card shadow-sm border-0 custom-card px-3 py-2">
                        <div class="card-body">
                            <h4 class="card-title fw-bold text-dark">${app.title}</h4>
                            <h6 class="card-subtitle mb-3 text-muted">${app.company}</h6>
                            
                            <div class="timeline-container border rounded p-3 bg-light shadow-sm" style="max-width:650px; margin-left:0;">
                                <div class="timeline-step ${progressApplied}">
                                    <div class="timeline-icon"><i class="bi bi-cloud-check"></i></div>
                                    <div class="timeline-text">Applied Phase</div>
                                </div>
                                <div class="timeline-step ${progressShortlisted}">
                                    <div class="timeline-icon"><i class="bi bi-search"></i></div>
                                    <div class="timeline-text">Screening & Interview</div>
                                </div>
                                <div class="timeline-step ${progressSelected}">
                                    <div class="timeline-icon"><i class="bi bi-trophy"></i></div>
                                    <div class="timeline-text">Hired & Closed</div>
                                </div>
                            </div>
                            
                            ${interviewBlock}
                            ${app.status === 'Rejected' ? `<div class="alert alert-danger mt-3 small border-0 fw-bold"><i class="bi bi-x-circle-fill"></i> Unfortunate Update: We moved forward with other candidates.</div>` : ''}
                        </div>
                    </div>
                 `;
                 list.appendChild(card);
            });
        }
    } catch { list.innerHTML = `<div class="col-12 text-danger text-center mt-5"><h5>Pipeline tracking disconnected bounds.</h5></div>`; }
}

function generateRecommendations() {
    const recBox = document.getElementById("recommendedJobsList");
    if(!recBox) return;
    
    if(globalApplications.length === 0 || globalOpportunities.length === 0) {
        recBox.innerHTML = `<div class="col-12 text-muted text-center mt-4 mb-3 border border-dashed rounded py-4 fw-bold opacity-75">🚀 Start exploring opportunities to unlock recommendations!</div>`;
        return;
    }
    
    let keywordsDict = new Set();
    globalApplications.forEach(app => {
        let words = app.title.toLowerCase().split(' ');
        words.forEach(w => { if(w.length > 3) keywordsDict.add(w); }); 
    });

    let recommended = [];
    globalOpportunities.forEach(job => {
        const pushed = globalApplications.find(a => a.opportunity_id == job.id);
        if(!pushed) {
            let matchesTag = false;
            let titleWords = job.title.toLowerCase().split(' ');
            titleWords.forEach(w => { if(keywordsDict.has(w)) matchesTag = true; });
            if(matchesTag) recommended.push(job);
        }
    });

    recBox.innerHTML = "";
    
    // Fallback logic: If no direct keyword algorithms match, recommend remaining jobs
    if(recommended.length === 0) {
        globalOpportunities.forEach(job => {
            const pushed = globalApplications.find(a => a.opportunity_id == job.id);
            if(!pushed) recommended.push(job);
        });
    }

    if(recommended.length === 0) {
       recBox.innerHTML = `<div class="col-12 text-muted text-center mt-4 mb-3 border border-dashed rounded py-4 fw-bold opacity-75">🎉 You have applied to everything available!</div>`;
       return;
    }
    
    const sliced = recommended.slice(0, 2);
    sliced.forEach(job => {
        recBox.innerHTML += `
            <div class="col-md-6 mb-3">
                <div class="card h-100 shadow custom-card border-0 border-warning border-start border-4">
                    <div class="card-body">
                        <h5 class="fw-bold mb-1">${job.title}</h5>
                        <h6 class="text-muted small">${job.company}</h6>
                        <span class="badge bg-light text-dark mt-2 border"><i class="bi bi-robot"></i> Algo Match</span>
                        <button class="btn btn-sm btn-outline-warning d-block mt-3 w-100 fw-bold shadow-sm" onclick="switchSection('jobs', document.querySelectorAll('.sidebar-nav .nav-link')[1])">Open Portal</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ========= FETCH DYNAMIC EVENTS & RESOURCES ==========

async function loadMyEvents() {
    const email = localStorage.getItem("userEmail");
    if(!email) return;
    try {
        const res = await fetch(`${API_BASE_URL}get_my_events.php?email=${email}`);
        const parsed = await res.json();
        if(parsed.status === "success") { globalMyEvents = parsed.data; }
    } catch {}
}

async function loadEvents() {
    const box = document.getElementById("eventsListContainer");
    if(!box) return;
    try {
        await loadMyEvents(); // Step: check kar rahe hain user already enroll hai ya nahi persistently
        const res = await fetch(`${API_BASE_URL}get_events.php`);
        const json = await res.json();
        box.innerHTML = "";
        
        if (json.status === "success" && json.data.length > 0) {
            json.data.forEach(evt => {
                // Step 1: check kar rahe hain user already enroll hai ya nahi
                let isEnrolled = globalMyEvents.some(idLock => idLock == evt.id);
                
                let btnHtml = isEnrolled ? 
                    `<button class="btn btn-secondary text-white fw-bold w-100 disabled shadow-none">✅ Enrolled</button>` :
                    `<button class="btn btn-dark fw-bold w-100 shadow-sm" id="btn-evt-${evt.id}" onclick="registerEvent(${evt.id}, this)">🚀 Enroll in Event</button>`;

                box.innerHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card custom-card shadow-sm p-4 border-0">
                            <h5 class="fw-bold text-dark"><i class="bi bi-calendar2-star text-warning"></i> ${evt.name}</h5>
                            <p class="text-muted small mb-2 fw-bold"><i class="bi bi-calendar px-1"></i> Date: ${evt.event_date}</p>
                            <p class="small text-secondary mb-3">${evt.description}</p>
                            ${btnHtml}
                        </div>
                    </div>
                `;
            });
        } else {
             box.innerHTML = `<div class="col-12 py-5 text-center text-muted h4 border rounded opacity-50 border-dashed">Nothing here yet! Start exploring 🚀</div>`;
        }
    } catch { box.innerHTML = `<div class="text-danger">Failed connecting events database map.</div>`; }
}

async function registerEvent(id, btnRef) {
    btnRef.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Trajectory...`;
    btnRef.disabled = true;
    try {
        const payload = { email: localStorage.getItem("userEmail"), event_id: id };
        const res = await fetch(`${API_BASE_URL}register_event.php`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const mapped = await res.json();
        if(mapped.status === "success") { 
            showSaasToast("🎉 You have successfully registered!"); 
            globalMyEvents.push(id); // push to array bound dynamically
            btnRef.className = "btn btn-secondary text-white fw-bold w-100 disabled shadow-none";
            btnRef.innerHTML = "✅ Enrolled";
        } else { showAlert("dashboardAlert", "warning", mapped.message); btnRef.disabled = false; btnRef.innerHTML = "🚀 Enroll in Event"; }
    } catch(err) { showAlert("dashboardAlert", "danger", "Database lock."); btnRef.disabled = false; btnRef.innerHTML = "🚀 Enroll in Event"; }
}

// ====== DYNAMIC CATEGORIES CORE ======

async function loadCategories() {
    const sel = document.getElementById("resourceCategory");
    if (!sel) return;
    try {
        const res = await fetch(`${API_BASE_URL}get_categories.php`);
        const json = await res.json();
        sel.innerHTML = `<option value="" disabled selected>Select an explicit target mapping...</option>`;
        if (json.status === "success") {
            json.data.forEach(cat => {
                sel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        } else {
            sel.innerHTML = `<option value="" disabled>Categories fail state.</option>`;
        }
    } catch {
        sel.innerHTML = `<option value="" disabled>Sync dropped.</option>`;
    }
}

const addCatForm = document.getElementById("addCategoryForm");
if (addCatForm) {
    addCatForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const payload = { name: document.getElementById("newCategoryName").value };
        const btn = document.getElementById("addCategorySubmitBtn");
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Syncing...`;
        
        try {
            const res = await fetch(`${API_BASE_URL}add_category.php`, { method:'POST', body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.status === "success") {
                showSaasToast(data.message);
                addCatForm.reset();
                let modalInstance = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
                if(modalInstance) { modalInstance.hide(); }
                await loadCategories(); // refresh logic seamlessly
            } else { showAlert("adminAlert", "warning", data.message); }
        } catch { showAlert("adminAlert", "danger", "Database lock structure prevented addition."); }
        btn.disabled = false;
        btn.innerHTML = `Save Route`;
    });
}
    
async function loadResources() {
    const box = document.getElementById("resourcesListContainer");
    if(!box) return;
    try {
        const res = await fetch(`${API_BASE_URL}get_resources.php`);
        const json = await res.json();
        box.innerHTML = "";
        
        if (json.status === "success" && json.data.length > 0) {
            json.data.forEach(item => {
                let catLower = item.category ? item.category.toLowerCase() : "";
                let badgeClass = "badge-others";
                if (catLower.includes("resume")) badgeClass = "badge-resume";
                else if (catLower.includes("coding")) badgeClass = "badge-coding";
                else if (catLower.includes("system design")) badgeClass = "badge-system";
                else if (catLower.includes("interview")) badgeClass = "badge-interview";
                else if (catLower.includes("aptitude")) badgeClass = "badge-aptitude";

                box.innerHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card custom-card p-3 border-0 shadow-sm border-start border-4 resource-card" style="border-left-color: var(--bs-primary) !important;">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="fw-bold mb-1">${item.title}</h6>
                                    <span class="badge shadow-sm border r-badge ${badgeClass}">${item.category || "Uncategorized"}</span>
                                </div>
                                <a href="${item.link}" target="_blank" class="btn btn-sm btn-dark">Open <i class="bi bi-box-arrow-up-right ms-1"></i></a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else { box.innerHTML = `<div class="col-12 py-5 text-center text-muted h4 border rounded opacity-50 border-dashed">Nothing here yet! Start exploring 🚀</div>`; }
    } catch { box.innerHTML = `<div class="text-danger">Resources logic pipeline dropped.</div>`; }
}

async function loadProfile() {
    const mailDisplay = document.getElementById('profileEmail');
    if(!mailDisplay) return; 
    
    const email = localStorage.getItem("userEmail");
    document.getElementById('profileEmail').innerText = email;
    document.getElementById('userEmailDisplay').innerText = email; 
    
    try {
        const res = await fetch(`${API_BASE_URL}get_profile.php?email=${email}`);
        const result = await res.json();
        if(result.status === "success") {
            document.getElementById("profileSkills").value = result.data.skills || "";
            document.getElementById("profileCgpa").value = result.data.cgpa || "";
        }
    } catch(err) { console.log("Profile parameters failure."); }
}

const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

if(editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
         document.getElementById("profileSkills").disabled = false;
         document.getElementById("profileCgpa").disabled = false;
         editProfileBtn.classList.add("d-none");
         saveProfileBtn.classList.remove("d-none");
    });
}
const profileForm = document.getElementById("profileForm");
if(profileForm) {
    profileForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const payload = {
            email: localStorage.getItem("userEmail"),
            skills: document.getElementById("profileSkills").value,
            cgpa: document.getElementById("profileCgpa").value
        };
        saveProfileBtn.innerHTML = "Processing Trace...";
        
        try {
            const res = await fetch(`${API_BASE_URL}update_profile.php`, {
                method: "POST", headers: { "Content-Type" : "application/json" }, body: JSON.stringify(payload)
            });
            const parsed = await res.json();
            if(parsed.status === "success") {
                showSaasToast("✅ Profile permanently safely recorded!");
                document.getElementById("profileSkills").disabled = true;
                document.getElementById("profileCgpa").disabled = true;
                saveProfileBtn.classList.add("d-none");
                editProfileBtn.classList.remove("d-none");
            } else { showAlert("dashboardAlert", "danger", parsed.message); }
        } catch(er) { showAlert("dashboardAlert", "danger", "Database lock preventing saves."); }
        saveProfileBtn.innerHTML = "💾 Commit Secure Configurations";
    });
}


// ====== ADMIN RECRUITMENT PLATFORM LOGIC ======

const addForm = document.getElementById("addOpportunityForm");
if (addForm) {
    addForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById("jobTitle").value, company: document.getElementById("companyName").value,
            description: document.getElementById("jobDescription").value, eligibility: document.getElementById("jobEligibility").value,
            location: document.getElementById("jobLocation").value || 'Remote Sector', salary: document.getElementById("jobSalary").value || 'Not Disclosed',
            job_type: document.getElementById("jobType").value || 'Corporate Framework'
        };
        try {
            const res = await fetch(`${API_BASE_URL}add_opportunity.php`, { method: 'POST', body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.status === "success") {
                showSaasToast("✅ Opportunity posted successfully!");
                addForm.reset(); loadAdminData(); 
            } else { showAlert("adminAlert", "danger", data.message); }
        } catch { showAlert("adminAlert", "danger", "Node connection sync failure."); }
    });
}

const eventForm = document.getElementById("addEventForm");
if(eventForm) {
    eventForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById("eventName").value,
            date: document.getElementById("eventDate").value,
            description: document.getElementById("eventDescription").value
        };
        try {
            const res = await fetch(`${API_BASE_URL}add_event.php`, { method:'POST', body: JSON.stringify(payload) });
            const parsed = await res.json();
            if(parsed.status === "success") {
                showSaasToast("✅ Event generated and pushed successfully!");
                eventForm.reset(); loadEnrolledStudents(); // refresh UI array bounds dynamically
            } else { showAlert("adminAlert", "warning", parsed.message); }
        } catch { showAlert("adminAlert", "danger", "Core connection broken bounds."); }
    });
}

const resourceForm = document.getElementById("addResourceForm");
if(resourceForm) {
    resourceForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById("resourceTitle").value,
            category_id: document.getElementById("resourceCategory").value,
            link: document.getElementById("resourceLink").value
        };
        try {
            const res = await fetch(`${API_BASE_URL}add_resource.php`, { method:'POST', body: JSON.stringify(payload) });
            const parsed = await res.json();
            if(parsed.status === "success") {
                showSaasToast("✅ Learning Resource stored natively on mapping!");
                resourceForm.reset();
                loadAdminResources();
            } else { showAlert("adminAlert", "warning", parsed.message); }
        } catch { showAlert("adminAlert", "danger", "Database lock strings bounds."); }
    });
}

/* ====== ADVANCED UI MODS: DRAG & SCROLL KANBAN LOGIC ====== */
const kanbanBoard = document.getElementById('kanbanBoardWrapper');
if (kanbanBoard) {
    let isDown = false;
    let startX;
    let scrollLeft;

    kanbanBoard.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - kanbanBoard.offsetLeft;
        scrollLeft = kanbanBoard.scrollLeft;
    });

    kanbanBoard.addEventListener('mouseleave', () => { isDown = false; });
    kanbanBoard.addEventListener('mouseup', () => { isDown = false; });

    kanbanBoard.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - kanbanBoard.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag momentum
        kanbanBoard.scrollLeft = scrollLeft - walk;
    });
}

function scrollKanban(amount) {
    const board = document.getElementById('kanbanBoardWrapper');
    if(board) { board.scrollBy({ left: amount, behavior: 'smooth' }); }
}


async function viewStudentProfile(emailTarget) {
    document.getElementById("scanEmailAddress").innerText = emailTarget;
    document.getElementById("scanTechnicalSkills").value = "Fetching core metrics...";
    document.getElementById("scanCgpa").value = "Loading...";
    
    const snap = new bootstrap.Modal(document.getElementById('profileViewerModal'));
    snap.show();
    
    try {
        const req = await fetch(`${API_BASE_URL}get_profile.php?email=${emailTarget}`);
        const parsed = await req.json();
        if(parsed.status === "success") {
            document.getElementById("scanTechnicalSkills").value = parsed.data.skills || "Not specified by student yet.";
            document.getElementById("scanCgpa").value = parsed.data.cgpa || "Not provided.";
        } else {
            document.getElementById("scanTechnicalSkills").value = "Error reading student configuration mappings.";
            document.getElementById("scanCgpa").value = "Error";
        }
    } catch {
        document.getElementById("scanTechnicalSkills").value = "System pipeline decoupled.";
        document.getElementById("scanCgpa").value = "0.0";
    }
}

async function loadEnrolledStudents() {
    const tableBody = document.getElementById("enrolledStudentsTableBody");
    if(!tableBody) return;
    try {
        const res = await fetch(`${API_BASE_URL}get_enrolled_students.php`);
        const parsed = await res.json();
        tableBody.innerHTML = "";
        
        // Step 2: admin ko enrolled students dikha rahe hain by mapping schemas securely
        if(parsed.status === "success" && parsed.data.length > 0) {
            parsed.data.forEach(en => {
                tableBody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-dark"><i class="bi bi-calendar-event text-warning"></i> ${en.event_name}</td>
                        <td class="text-muted"><i class="bi bi-envelope-fill text-secondary me-1"></i> ${en.email}</td>
                        <td class="small fw-bold">${new Date(en.registered_at).toLocaleDateString()}</td>
                    </tr>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted h6 py-4 opacity-50 border-dashed rounded">Nothing here yet! 🚀</td></tr>`;
        }
    } catch { tableBody.innerHTML = `<tr><td colspan="3" class="text-danger ps-2">Db sync mapping failed</td></tr>` }
}


async function loadAdminEvents() {
    const grid = document.getElementById("adminEventsGrid");
    if(!grid) return;
    try {
        const res = await fetch(`${API_BASE_URL}get_admin_events.php`);
        const parsed = await res.json();
        grid.innerHTML = "";
        if(parsed.status === "success" && parsed.data.length > 0) {
            parsed.data.forEach(ev => {
                grid.innerHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card p-3 shadow-sm border-0 border-start border-4 border-warning h-100 custom-card">
                            <h6 class="fw-bold"><i class="bi bi-calendar-event text-warning me-1"></i> ${ev.name}</h6>
                            <p class="small text-muted mb-2">${ev.description}</p>
                            <div class="d-flex justify-content-between align-items-center mt-auto border-top pt-2">
                                <span class="badge bg-light text-dark shadow-sm border"><i class="bi bi-people-fill text-primary"></i> ${ev.enrolled_count} Students Enrolled</span>
                                <button class="btn btn-sm btn-outline-danger shadow-sm fw-bold" onclick="deleteEvent(${ev.id})"><i class="bi bi-trash"></i> Delete Node</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else { grid.innerHTML = `<div class="col-12 text-center text-muted py-4 mt-2 opacity-50 border border-dashed rounded bg-light">Nothing perfectly mapped yet 🚀</div>`; }
    } catch {}
}

async function deleteEvent(id) {
    if(!confirm("Destroying this Event removes all student enrollments securely! Proceed?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}delete_event.php`, { method: "POST", body: JSON.stringify({id: id}) });
        const parsed = await res.json();
        if(parsed.status === "success") { showSaasToast(parsed.message); loadAdminEvents(); loadEnrolledStudents(); }
        else { showAlert("adminAlert", "warning", parsed.message); }
    } catch { }
}

async function loadAdminResources() {
    const grid = document.getElementById("adminResourcesGrid");
    if(!grid) return;
    try {
        const res = await fetch(`${API_BASE_URL}get_resources.php`);
        const parsed = await res.json();
        grid.innerHTML = "";
        if(parsed.status === "success" && parsed.data.length > 0) {
            parsed.data.forEach(item => {
                let catLower = item.category ? item.category.toLowerCase() : "";
                let badgeClass = "badge-others";
                if (catLower.includes("resume")) badgeClass = "badge-resume";
                else if (catLower.includes("coding")) badgeClass = "badge-coding";
                else if (catLower.includes("system design")) badgeClass = "badge-system";
                else if (catLower.includes("interview")) badgeClass = "badge-interview";
                else if (catLower.includes("aptitude")) badgeClass = "badge-aptitude";

                grid.innerHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card p-3 shadow-sm border-0 border-start border-4 border-info h-100 custom-card resource-card">
                            <div class="d-flex justify-content-between">
                                <h6 class="fw-bold mb-1">${item.title}</h6>
                                <span class="badge shadow-sm border r-badge ${badgeClass}">${item.category || "Uncategorized"}</span>
                            </div>
                            <div class="mt-auto border-top pt-2 mt-3 d-flex justify-content-between">
                                <a href="${item.link}" target="_blank" class="btn btn-sm btn-dark"><i class="bi bi-link-45deg"></i> Open</a>
                                <button class="btn btn-sm btn-outline-danger shadow-sm fw-bold" onclick="deleteResource(${item.id})"><i class="bi bi-trash"></i> Drop Route</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else { grid.innerHTML = `<div class="col-12 text-center text-muted py-4 mt-2 opacity-50 border border-dashed rounded bg-light">No resources currently bound securely!</div>`; }
    } catch {}
}

async function deleteResource(id) {
    if(!confirm("Are you confident you trace mapping drops?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}delete_resource.php`, { method: "POST", body: JSON.stringify({id: id}) });
        const parsed = await res.json();
        if(parsed.status === "success") { showSaasToast(parsed.message); loadAdminResources(); }
        else { showAlert("adminAlert", "warning", parsed.message); }
    } catch { }
}

async function loadAdminData() {
    const kpiWrap = document.getElementById("kpiTotalApps");
    if(!kpiWrap) return; 
    
    loadEnrolledStudents(); // Fetch dynamic event tracking lists
    loadAdminEvents();
    loadCategories(); // Inject dynamic categories natively!
    loadAdminResources();
    
    const kCols = {
        "Applied": document.getElementById("cards-Applied"), "Screening": document.getElementById("cards-Screening"),
        "Interview": document.getElementById("cards-Interview"), "Selected": document.getElementById("cards-Selected"),
        "Rejected": document.getElementById("cards-Rejected")
    };
    const kBadges = {
        "Applied": document.getElementById("badge-Applied"), "Screening": document.getElementById("badge-Screening"),
        "Interview": document.getElementById("badge-Interview"), "Selected": document.getElementById("badge-Selected"),
        "Rejected": document.getElementById("badge-Rejected")
    };
    
    Object.values(kCols).forEach(col => { if(col) col.innerHTML = ""; });

    try {
        const res = await fetch(`${API_BASE_URL}all_applications.php`);
        const result = await res.json();
            
        let counts = { "Applied":0, "Screening":0, "Interview":0, "Selected":0, "Rejected":0 };
        let totalCount = 0; let hiredCount = 0; let jobStats = {};
        
        if (result.status === "success" && result.data && result.data.length > 0) {
            result.data.forEach(app => {
                let srt = app.status;
                if(!kCols[srt]) srt = "Applied"; 

                counts[srt]++; totalCount++;
                if(srt === 'Selected') hiredCount++;
                if (jobStats[app.title]) jobStats[app.title]++; else jobStats[app.title] = 1;

                let resumeBtn = app.resume ? `<a href="${API_BASE_URL}../${app.resume}" target="_blank" class="btn btn-sm btn-light border w-100 fw-bold shadow-sm mb-1"><i class="bi bi-file-earmark-pdf-fill text-danger"></i> View Resume</a>` : `<div class="alert alert-light border small text-center fw-bold p-1 mb-1 text-muted">No resume uploaded</div>`;
                let profileBtn = `<button class="btn btn-sm btn-dark w-100 fw-bold shadow-sm mb-2" onclick="viewStudentProfile('${app.student_email}')">👤 View Profile</button>`;

                let formActions = "";
                if(srt === 'Applied') {
                    formActions = `<button class="btn btn-sm btn-info w-100 fw-bold mb-1 shadow-sm text-dark" onclick="updateAppStatus(${app.id}, 'Screening')">Approve ➡️</button>
                                   <button class="btn btn-sm btn-outline-danger w-100 shadow-sm fw-bold" onclick="updateAppStatus(${app.id}, 'Rejected')">Reject 🛑</button>`;
                } else if(srt === 'Screening') {
                    formActions = `<button class="btn btn-sm btn-primary w-100 fw-bold mb-1 shadow-sm" onclick="prepareInterview(${app.id})">📅 Schedule Interview</button>
                                   <button class="btn btn-sm btn-outline-danger w-100 shadow-sm fw-bold" onclick="updateAppStatus(${app.id}, 'Rejected')">Reject 🛑</button>`;
                } else if(srt === 'Interview') {
                    formActions = `<button class="btn btn-sm btn-success w-100 fw-bold mb-1 shadow-sm" onclick="updateAppStatus(${app.id}, 'Selected')">Approve ➡️</button>
                                   <button class="btn btn-sm btn-outline-danger w-100 shadow-sm fw-bold" onclick="updateAppStatus(${app.id}, 'Rejected')">Reject 🛑</button>`;
                } else {
                     formActions = `<span class="badge ${srt === 'Selected' ? 'bg-success' : 'bg-danger'} w-100 p-2"><i class="bi bi-lock"></i> Final Stage Resolved</span>`;
                }

                const cardBox = document.createElement("div");
                cardBox.className = "kanban-card";
                cardBox.innerHTML = `<div class="kanban-card-title">${app.title}</div><div class="kanban-card-email"><i class="bi bi-envelope-fill text-muted me-2"></i> ${app.student_email}</div>${resumeBtn}${profileBtn}<div class="kanban-card-actions">${formActions}</div>`;
                kCols[srt].appendChild(cardBox);
            });
            
            Object.keys(kBadges).forEach(tag => {
                if(kBadges[tag]) {
                    kBadges[tag].innerText = counts[tag] || 0;
                    if(counts[tag] === 0) kCols[tag].innerHTML = `<div class="text-muted text-center small mt-3 fw-bold opacity-50 border border-dashed rounded p-3">Nothing here yet! 🚀</div>`;
                }
            });
            renderAdminCharts(jobStats, counts);  
        } else {
             document.getElementById('kanbanBoardWrapper').innerHTML = `<div class="col-12 py-5 text-center text-muted h4 border rounded border-dashed opacity-75">Nothing here yet! Start exploring 🚀</div>`;
             renderAdminCharts({"No Active Data": 1}, counts);
        }
        
        document.getElementById("kpiTotalApps").innerText = totalCount;
        document.getElementById("kpiShortlisted").innerText = counts["Screening"] + counts["Interview"];
        document.getElementById("kpiHiringRate").innerText = totalCount === 0 ? "0%" : `${Math.round((hiredCount/totalCount)*100)}%`;
    } catch { console.warn("Candidates tracking fetch issues in UI bounds.") }
    
    // Opportunities Fetch List Array logic maps
    const jobsGrid = document.getElementById("activeJobsGrid");
    if(jobsGrid) {
        let fetchJobs = await fetch(`${API_BASE_URL}get_opportunities.php`).then(r => r.json());
        if(fetchJobs.status === "success") {
            globalAdminJobs = fetchJobs.data;
            jobsGrid.innerHTML = "";
            document.getElementById("kpiTotalJobs").innerText = fetchJobs.data.length; 
            fetchJobs.data.forEach(job => {
                 let tagType = job.job_type === "Internship" ? "bg-warning text-dark" : "bg-info text-dark";
                 jobsGrid.innerHTML += `
                    <div class="col-md-6 mb-3">
                        <div class="card job-admin-card shadow-sm h-100 p-3 border-0 rounded-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="fw-bold mb-1">${job.title}</h6>
                                    <p class="text-muted small mb-0"><i class="bi bi-building"></i> ${job.company}</p>
                                </div>
                                <span class="badge ${tagType} shadow-sm border">${job.job_type}</span>
                            </div>
                            <!-- Small status tag -->
                            <div class="mb-3"><span class="badge bg-light text-secondary border px-2 py-1"><i class="bi bi-radar"></i> Active Node</span></div>
                            
                            <div class="mt-auto border-top pt-3 d-flex gap-2">
                                <button class="btn btn-sm btn-outline-secondary w-50 fw-bold shadow-sm rounded-pill" onclick="openEditJobModal(${job.id})"><i class="bi bi-pencil-square"></i> Edit</button>
                                <button class="btn btn-sm btn-danger w-50 fw-bold shadow-sm rounded-pill" onclick="deleteOpportunity(${job.id})"><i class="bi bi-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                 `;
            });
            if(fetchJobs.data.length === 0) jobsGrid.innerHTML = `<div class="col-12 text-center text-muted py-5 mt-3 opacity-50 border border-dashed rounded bg-light">🚀 Start exploring opportunities to unlock recommendations!</div>`;
        }
    }
}

async function deleteOpportunity(id) {
    if(!confirm("Are you sure? This triggers a CASCADE dropping all candidate tracks tied here!")) return;
    const res = await fetch(`${API_BASE_URL}delete_opportunity.php`, { method: "POST", body: JSON.stringify({id: id}) });
    const parsed = await res.json();
    if(parsed.status === "success") { showSaasToast("✅ Opportunity node destroyed successfully"); loadAdminData(); 
    } else { showAlert("adminAlert", "danger", parsed.message); }
}

function openEditJobModal(jobId) {
    const job = globalAdminJobs.find(j => j.id == jobId);
    if(!job) return;
    document.getElementById("editJobId").value = job.id;
    document.getElementById("editJobTitle").value = job.title;
    document.getElementById("editJobCompany").value = job.company;
    document.getElementById("editJobDescription").value = job.description;
    document.getElementById("editJobEligibility").value = job.eligibility;
    document.getElementById("editJobLocation").value = job.location || "";
    document.getElementById("editJobSalary").value = job.salary || "";
    document.getElementById("editJobType").value = job.job_type || "Full-time";
    
    const m = new bootstrap.Modal(document.getElementById('editJobModal'));
    m.show();
}

const editJobForm = document.getElementById("editJobForm");
if(editJobForm) {
    editJobForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const payload = {
            id: document.getElementById("editJobId").value,
            title: document.getElementById("editJobTitle").value,
            company: document.getElementById("editJobCompany").value,
            description: document.getElementById("editJobDescription").value,
            eligibility: document.getElementById("editJobEligibility").value,
            location: document.getElementById("editJobLocation").value,
            salary: document.getElementById("editJobSalary").value,
            job_type: document.getElementById("editJobType").value
        };
        const btn = editJobForm.querySelector('button[type="submit"]');
        btn.innerText = "Processing...";
        try {
            const res = await fetch(`${API_BASE_URL}edit_opportunity.php`, { method:'POST', body: JSON.stringify(payload) });
            const data = await res.json();
            if(data.status === "success") {
                showSaasToast("✅ Edit Successful");
                let inst = bootstrap.Modal.getInstance(document.getElementById('editJobModal'));
                inst.hide();
                loadAdminData();
            } else { showAlert("adminAlert", "danger", data.message); }
        } catch { showAlert("adminAlert", "danger", "Failed to update node."); }
        btn.innerText = "Commit Edit Globally";
    });
}

function prepareInterview(appId) {
    document.getElementById("schedAppId").value = appId;
    const modalBase = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modalBase.show();
}

const schedForm = document.getElementById("scheduleForm");
if(schedForm) {
    schedForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            id: document.getElementById("schedAppId").value, status: "Interview",
            interview_date: document.getElementById("schedDate").value, interview_time: document.getElementById("schedTime").value,
            interview_mode: document.getElementById("schedMode").value, message: document.getElementById("schedMessage").value
        };
        const btn = schedForm.querySelector('button[type="submit"]');
        btn.innerText = "Processing Sequence...";
        
        try {
            const res = await fetch(`${API_BASE_URL}update_status.php`, { method: 'POST', body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.status === "success") {
                let inst = bootstrap.Modal.getInstance(document.getElementById('scheduleModal')); inst.hide();
                schedForm.reset(); showSaasToast("✅ Candidate moved to Interview stage"); loadAdminData(); 
            } else { showAlert("adminAlert", "danger", data.message); }
        } catch { showAlert("adminAlert", "danger", "Status sequence bounds broken!"); }
        btn.innerText = "Shortlist Phase Execution";
    });
}

async function updateAppStatus(appId, newStatus) {
    if(newStatus === 'Rejected' && !confirm("Are you absolutely sure you want to terminate this applicant?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}update_status.php`, { method: 'POST', body: JSON.stringify({ id: appId, status: newStatus }) });
        const data = await res.json();
        if (data.status === "success") { showSaasToast(`✅ Candidate moved correctly to ${newStatus} stage!`); loadAdminData(); 
        } else { showAlert("adminAlert", "danger", data.message); }
    } catch { showAlert("adminAlert", "danger", "Node pipeline tracking failure strings."); }
}

let chartAppInst = null; let chartConvInst = null;
function renderAdminCharts(jobStats, convertStats) {
    const appCtx = document.getElementById('applicationsChart');
    if (appCtx) {
        if (chartAppInst) chartAppInst.destroy();
        const labels = Object.keys(jobStats); const data = Object.values(jobStats);
        chartAppInst = new Chart(appCtx, {
            type: 'doughnut', data: { labels: labels, datasets: [{ label: 'Incoming Tracking', data: data, backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0'], hoverOffset: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    }
    const convCtx = document.getElementById('conversionChart');
    if (convCtx) {
        if (chartConvInst) chartConvInst.destroy();
        chartConvInst = new Chart(convCtx, {
            type: 'bar', data: { labels: ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected'], datasets: [{ label: 'Phase Counters', data: [convertStats.Applied, convertStats.Screening, convertStats.Interview, convertStats.Selected, convertStats.Rejected], backgroundColor: ['#adb5bd', '#0dcaf0', '#0d6efd', '#198754', '#dc3545'] }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
        });
    }
}
