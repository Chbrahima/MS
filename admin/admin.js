document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if user is logged in
    checkAuthStatus();
    
    // Setup file upload handlers
    setupFileUploadHandlers();
    
    // Load saved values
    if (window.location.pathname.includes('dashboard.html')) {
        loadPdfs();
        loadSavedTimers();
        loadSavedTitles();
    }
});

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication (you should use a more secure method in production)
    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'dashboard.html';
    } else {
        alert('Nom d\'utilisateur ou mot de passe incorrect');
    }
}

// Check if user is logged in
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    // If we're on the dashboard page but not logged in
    if (window.location.pathname.includes('dashboard.html') && !isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // If we're on the login page and already logged in
    if (window.location.pathname.includes('login.html') && isLoggedIn) {
        window.location.href = 'dashboard.html';
        return;
    }
}

// Handle logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}

// Clear login status when closing/leaving dashboard
window.addEventListener('beforeunload', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        sessionStorage.removeItem('adminLoggedIn');
    }
});

// Load saved timer values
function loadSavedTimers() {
    const s1s3Date = localStorage.getItem('s1s3ExamDate');
    const s5Date = localStorage.getItem('s5ExamDate');
    
    if (s1s3Date) {
        document.getElementById('s1s3Timer').value = new Date(s1s3Date).toISOString().slice(0, 10);
    }
    
    if (s5Date) {
        document.getElementById('s5Timer').value = new Date(s5Date).toISOString().slice(0, 10);
    }
}

// Load saved titles
function loadSavedTitles() {
    const titles = {
        'annual': 'Calendrier Annuel',
        'schedule': 'Emploi du temps',
        'devoir': 'Emploi Devoir',
        'exam': 'Emploi Exam',
        's1s3': 'S1 & S3 Examens',
        's5': 'S5 Examens'
    };
    
    for (const [key, defaultTitle] of Object.entries(titles)) {
        const savedTitle = localStorage.getItem(`${key}Title`);
        if (savedTitle) {
            document.getElementById(`${key}Title`).value = savedTitle;
        }
    }
}

// Update PDF title
function updatePdfTitle(type) {
    const titleInput = document.getElementById(`${type}Title`);
    const newTitle = titleInput.value.trim();
    
    if (newTitle) {
        localStorage.setItem(`${type}Title`, newTitle);
        
        // Update main page if it exists
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

// Update timer title
function updateTimerTitle(type) {
    const titleInput = document.getElementById(`${type}Title`);
    const newTitle = titleInput.value.trim();
    
    if (newTitle) {
        localStorage.setItem(`${type}Title`, newTitle);
        
        // Update main page if it exists
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

// Save PDF title
function savePdfTitle(type) {
    const titleInput = document.getElementById(`${type}Title`);
    const newTitle = titleInput.value.trim();
    
    if (!newTitle) {
        alert('Le titre ne peut pas être vide');
        return;
    }
    
    // Save to localStorage
    if (type === 'new') {
        // For new PDFs, we'll save the title when the file is uploaded
        return;
    }
    
    // For existing PDFs, update the title
    localStorage.setItem(`${type}Title`, newTitle);
    
    // Update main page if it exists
    if (window.opener) {
        window.opener.location.reload();
    }
    
    alert('Titre enregistré avec succès!');
}

// Save timer title
function saveTimerTitle(type) {
    const titleInput = document.getElementById(`${type}Title`);
    const newTitle = titleInput.value.trim();
    
    if (!newTitle) {
        alert('Le titre ne peut pas être vide');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem(`${type}Title`, newTitle);
    
    // Update main page if it exists
    if (window.opener) {
        window.opener.location.reload();
    }
    
    alert('Titre enregistré avec succès!');
}

// Setup file upload handlers
function setupFileUploadHandlers() {
    const fileInputs = {
        'annualUpload': 'pdfs/calendrier_annuel.pdf',
        'scheduleUpload': 'pdfs/emploi_du_temps.pdf',
        'devoirUpload': 'pdfs/emploi_devoir.pdf',
        'examUpload': 'pdfs/emploi_exam.pdf',
        'newPdfUpload': null
    };
    
    for (const [inputId, defaultPath] of Object.entries(fileInputs)) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', (e) => handleFileUpload(e, defaultPath));
        }
    }
}

// Handle file upload
async function handleFileUpload(event, defaultPath) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        alert('Veuillez sélectionner un fichier PDF valide');
        return;
    }
    
    const fileId = event.target.id;
    const isNewPdf = fileId === 'newPdfUpload';
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        let filePath;
        let title;
        let id;
        
        if (isNewPdf) {
            const titleInput = document.getElementById('newPdfTitle');
            title = titleInput.value.trim();
            
            if (!title) {
                alert('Veuillez entrer un titre pour le nouveau PDF');
                return;
            }
            
            // Create new file path and ID
            const fileName = title.toLowerCase().replace(/\s+/g, '_') + '.pdf';
            filePath = 'pdfs/' + fileName;  
            id = title.toLowerCase().replace(/\s+/g, '_');
            
            // Save metadata
            localStorage.setItem(`pdf_${id}Title`, title);
            localStorage.setItem(`pdf_${id}PdfPath`, filePath);
            
            // Clear form
            titleInput.value = '';
            event.target.value = '';
        } else {
            filePath = defaultPath;  
            id = fileId.replace('Upload', '');
            title = document.getElementById(`${id}Title`).value.trim();
            
            // Update metadata
            localStorage.setItem(`${id}Title`, title);
            localStorage.setItem(`pdf_${id}Title`, title);
            localStorage.setItem(`pdf_${id}PdfPath`, filePath);
        }
        
        formData.append('path', filePath);
        
        // Upload file
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du téléchargement');
        }
        
        // Update display
        if (!isNewPdf) {
            const displayId = 'current' + fileId.replace('Upload', '');
            const displayElement = document.getElementById(displayId);
            if (displayElement) {
                displayElement.textContent = 'Actuel: ' + file.name;
            }
        }
        
        // Show success message
        alert('PDF enregistré avec succès!');
        
        // Reload PDFs
        loadPdfs();
        
        // Update main page if it exists
        if (window.opener) {
            window.opener.location.reload();
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Erreur lors de l\'enregistrement du PDF. Veuillez réessayer.');
    }
}

// Save timer
function saveTimer(type) {
    const timerInput = document.getElementById(`${type}Timer`);
    if (!timerInput.value) {
        alert('Veuillez entrer une date valide');
        return;
    }
    
    const date = new Date(timerInput.value + 'T00:00:00');
    if (isNaN(date.getTime())) {
        alert('Veuillez entrer une date valide');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem(`${type}ExamDate`, date.toISOString());
    
    // Update main page if it exists
    if (window.opener) {
        window.opener.location.reload();
    }
    
    alert('Date mise à jour avec succès! Veuillez rafraîchir la page principale pour voir les changements.');
}

// Load all PDFs
function loadPdfs() {
    const pdfList = document.getElementById('pdfList');
    if (!pdfList) return;
    
    // Clear existing items
    pdfList.innerHTML = '';
    
    // Get all saved PDFs first
    const savedPdfs = new Map();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.endsWith('PdfPath')) {
            const baseKey = key.replace('PdfPath', '');
            const title = localStorage.getItem(baseKey + 'Title');
            const path = localStorage.getItem(key);
            if (title && path) {
                savedPdfs.set(path, {
                    id: baseKey.replace('pdf_', ''),
                    title: title,
                    path: path
                });
            }
        }
    }
    
    // Default PDFs (only add if not already in savedPdfs)
    const defaultPdfs = [
        {
            id: 'annual',
            title: 'Calendrier Annuel',
            path: 'pdfs/calendrier_annuel.pdf'
        },
        {
            id: 'schedule',
            title: 'Emploi du temps',
            path: 'pdfs/emploi_du_temps.pdf'
        },
        {
            id: 'devoir',
            title: 'Emploi Devoir',
            path: 'pdfs/emploi_devoir.pdf'
        },
        {
            id: 'exam',
            title: 'Emploi Exam',
            path: 'pdfs/emploi_exam.pdf'
        }
    ];
    
    // Add default PDFs if they're not already in savedPdfs
    for (const pdf of defaultPdfs) {
        if (!savedPdfs.has(pdf.path)) {
            savedPdfs.set(pdf.path, pdf);
        }
    }
    
    // Add all PDFs to the list
    for (const pdf of savedPdfs.values()) {
        addPdfToList(pdf.id, pdf.title, pdf.path, true);
    }
}

// Add PDF item to the list
function addPdfToList(id, title, path, isDeletable = true) {
    const pdfList = document.getElementById('pdfList');
    
    const pdfItem = document.createElement('div');
    pdfItem.className = 'pdf-item';
    pdfItem.innerHTML = `
        <div>
            <div class="title-group">
                <input type="text" class="title-input" id="${id}Title" value="${title}">
                <button class="save-btn" onclick="savePdfTitle('${id}')">
                    <i class="fas fa-save"></i> Enregistrer
                </button>
                <button class="delete-btn" onclick="deletePdf('${id}', '${path}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
            <div class="current-file" id="current${id}">Actuel: ${path.split('/').pop()}</div>
        </div>
        <div class="button-group">
            <input type="file" id="${id}Upload" accept=".pdf" style="display: none;">
            <button class="upload-btn" onclick="document.getElementById('${id}Upload').click()">
                <i class="fas fa-upload"></i> Remplacer
            </button>
        </div>
    `;
    
    pdfList.appendChild(pdfItem);
    
    // Add file upload handler
    const fileInput = document.getElementById(`${id}Upload`);
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFileUpload(e, path));
    }
}

// Delete PDF
async function deletePdf(id, path) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) {
        return;
    }
    
    try {
        // Send delete request to server first
        const formData = new FormData();
        formData.append('path', path);
        
        const response = await fetch('http://localhost:5000/delete', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erreur lors de la suppression');
        }
        
        // If server deletion was successful, remove from localStorage
        localStorage.removeItem(`${id}Title`);
        localStorage.removeItem(`pdf_${id}Title`);
        localStorage.removeItem(`pdf_${id}PdfPath`);
        
        // Reload PDFs
        loadPdfs();
        
        // Update main page if it exists
        if (window.opener) {
            window.opener.location.reload();
        }
        
        alert('PDF supprimé avec succès!');
    } catch (error) {
        console.error('Error deleting PDF:', error);
        alert(error.message || 'Erreur lors de la suppression du PDF. Veuillez réessayer.');
    }
}
