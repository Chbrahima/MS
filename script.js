class Module {
    constructor(name = '') {
        this.name = name;
        this.subjects = [];
        this.average = 0;
        this.status = '';
    }

    addSubject(subject) {
        this.subjects.push(subject);
    }

    calculateAverage() {
        if (this.subjects.length === 0) return 0;
        
        let totalWeightedScore = 0;
        let totalCoefficients = 0;
        
        this.subjects.forEach(subject => {
            if (subject.isValid()) {
                const subjectAverage = subject.calculateAverage();
                const coefficient = parseFloat(subject.coefficient);
                totalWeightedScore += subjectAverage * coefficient;
                totalCoefficients += coefficient;
            }
        });
        
        if (totalCoefficients === 0) return 0;
        
        this.average = Number((totalWeightedScore / totalCoefficients).toFixed(2));
        return this.average;
    }

    isValid() {
        return this.name && this.subjects.length > 0 && 
               this.subjects.every(subject => subject.isValid());
    }
}

class Subject {
    constructor(name = '', exam = '', devoir = '', coefficient = '') {
        this.name = name;
        this.exam = exam;
        this.devoir = devoir;
        this.coefficient = coefficient;
        this.average = 0;
        this.status = '';
    }

    calculateAverage() {
        if (!this.exam || !this.devoir || !this.coefficient) {
            this.average = 0;
            return 0;
        }
        
        const examGrade = parseFloat(this.exam);
        const devoirGrade = parseFloat(this.devoir);
        
        if (isNaN(examGrade) || isNaN(devoirGrade)) {
            this.average = 0;
            return 0;
        }
        
        this.average = (examGrade * 0.6 + devoirGrade * 0.4);
        return this.average;
    }

    isValid() {
        return this.name && 
               this.exam !== '' && 
               this.devoir !== '' && 
               this.coefficient !== '' &&
               !isNaN(this.exam) && 
               !isNaN(this.devoir) && 
               !isNaN(this.coefficient);
    }
}

class AcademicManager {
    constructor() {
        this.modules = [];
    }

    initializeEventListeners() {
        document.getElementById('addModule').addEventListener('click', () => this.addModule());
        document.getElementById('calculateAll').addEventListener('click', () => this.calculateAllModules());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDF());
    }

    addModule() {
        const moduleCount = this.modules.length + 1;
        const module = new Module(""); // Empty name initially
        this.modules.push(module);

        const moduleElement = document.createElement('div');
        moduleElement.className = 'module';
        moduleElement.id = `module${this.modules.length - 1}`;

        moduleElement.innerHTML = `
            <div class="module-header">
                <input type="text" class="module-name" placeholder="Nom du module" value="">
                <i class="fas fa-trash-alt delete-module" title="Supprimer le module"></i>
            </div>
            <div class="subjects"></div>
            <button class="btn add-subject">Ajouter une Matière</button>
            <div class="module-result">
                <div class="module-average"></div>
                <div class="module-status"></div>
            </div>
        `;

        document.getElementById('modulesSection').appendChild(moduleElement);

        // Add event listener for module name changes
        const moduleNameInput = moduleElement.querySelector('.module-name');
        moduleNameInput.addEventListener('input', () => {
            module.name = moduleNameInput.value;
        });

        // Add event listener for delete module icon
        moduleElement.querySelector('.delete-module').addEventListener('click', () => {
            this.deleteModule(this.modules.length - 1);
        });

        moduleElement.querySelector('.add-subject').addEventListener('click', () => {
            this.addSubject(this.modules.length - 1);
        });
    }

    deleteModule(moduleIndex) {
        this.modules.splice(moduleIndex, 1);
        const moduleElement = document.getElementById(`module${moduleIndex}`);
        moduleElement.remove();
        
        // Renumber remaining modules
        for (let i = moduleIndex; i < this.modules.length; i++) {
            const element = document.getElementById(`module${i + 1}`);
            if (element) {
                element.id = `module${i}`;
            }
        }
    }

    addSubject(moduleIndex) {
        const subjectElement = document.createElement('div');
        subjectElement.className = 'subject';
        
        subjectElement.innerHTML = `
            <div class="subject-inputs">
                <div class="input-group">
                    <input type="text" class="subject-name" placeholder="Nom de la matière">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="number" class="exam" min="0" max="20" step="0.25" placeholder="Note Examen" oninput="this.value = this.value > 20 ? 20 : this.value < 0 ? 0 : this.value">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="number" class="devoir" min="0" max="20" step="0.25" placeholder="Note du Devoir" oninput="this.value = this.value > 20 ? 20 : this.value < 0 ? 0 : this.value">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="number" class="coefficient" min="1" value="" placeholder="Crédit">
                    <span class="error-message"></span>
                </div>
            </div>
            <div class="subject-result" style="display: none;">
                <span class="subject-average"></span>
                <span class="subject-status"></span>
            </div>
            <i class="fas fa-trash-alt delete-subject" title="Supprimer la matière"></i>
        `;

        const subjectsContainer = document.querySelector(`#module${moduleIndex} .subjects`);
        subjectsContainer.appendChild(subjectElement);

        // Add delete subject event listener
        subjectElement.querySelector('.delete-subject').addEventListener('click', () => {
            const subjectIndex = Array.from(subjectsContainer.children).indexOf(subjectElement);
            this.deleteSubject(moduleIndex, subjectIndex);
        });

        // Add grade input restrictions
        const gradeInputs = subjectElement.querySelectorAll('.exam, .devoir');
        gradeInputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                // Allow: backspace, delete, tab, escape, enter
                if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39) ||
                    // Allow decimal point
                    (e.keyCode === 190 || e.keyCode === 110)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress if not
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                    (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            input.addEventListener('input', (e) => {
                let value = parseFloat(e.target.value);
                if (value > 20) {
                    e.target.value = 20;
                    this.showWarning(input, 'La note maximale est 20');
                } else if (value < 0) {
                    e.target.value = 0;
                    this.showWarning(input, 'La note minimale est 0');
                }
            });

            // Prevent paste of invalid values
            input.addEventListener('paste', (e) => {
                const pastedData = e.clipboardData.getData('text');
                const value = parseFloat(pastedData);
                if (isNaN(value) || value < 0 || value > 20) {
                    e.preventDefault();
                    this.showWarning(input, 'Veuillez coller une note valide entre 0 et 20');
                }
            });
        });

        // Validation functions
        const validateInput = (input, value) => {
            const errors = {
                name: '',
                exam: '',
                devoir: '',
                coefficient: ''
            };

            switch (input.className) {
                case 'subject-name':
                    if (!value.trim()) {
                        errors.name = 'Le nom de la matière est requis';
                    } else if (value.length < 2) {
                        errors.name = 'Le nom doit contenir au moins 2 caractères';
                    }
                    break;

                case 'exam':
                case 'devoir':
                    const numValue = parseFloat(value);
                    if (value === '') {
                        errors[input.className] = 'La note est requise';
                    } else if (isNaN(numValue)) {
                        errors[input.className] = 'Veuillez entrer un nombre valide';
                    } else if (numValue < 0) {
                        errors[input.className] = 'La note ne peut pas être négative';
                        input.value = 0;
                    } else if (numValue > 20) {
                        errors[input.className] = 'La note ne peut pas dépasser 20';
                        input.value = 20;
                    }
                    break;

                case 'coefficient':
                    const coefValue = parseInt(value);
                    if (!value) {
                        errors.coefficient = 'Le crédit est requis';
                    } else if (isNaN(coefValue) || coefValue < 1) {
                        errors.coefficient = 'Le crédit doit être un nombre positif';
                    }
                    break;
            }

            return errors;
        };

        const showError = (input, message) => {
            const errorSpan = input.parentElement.querySelector('.error-message');
            errorSpan.textContent = message;
            input.classList.toggle('error', message !== '');
        };

        // Add input event listeners
        const inputs = subjectElement.querySelectorAll('input');
        const module = this.modules[moduleIndex];
        let currentValues = {
            name: '',
            exam: '',
            devoir: '',
            coefficient: ''
        };

        const updateSubject = () => {
            const nameInput = subjectElement.querySelector('.subject-name');
            const examInput = subjectElement.querySelector('.exam');
            const devoirInput = subjectElement.querySelector('.devoir');
            const coefficientInput = subjectElement.querySelector('.coefficient');
            const resultDiv = subjectElement.querySelector('.subject-result');

            // Validate all inputs
            const errors = {
                ...validateInput(nameInput, nameInput.value),
                ...validateInput(examInput, examInput.value),
                ...validateInput(devoirInput, devoirInput.value),
                ...validateInput(coefficientInput, coefficientInput.value)
            };

            // Show errors if any
            showError(nameInput, errors.name);
            showError(examInput, errors.exam);
            showError(devoirInput, errors.devoir);
            showError(coefficientInput, errors.coefficient);

            // Update current values
            currentValues = {
                name: nameInput.value,
                exam: examInput.value,
                devoir: devoirInput.value,
                coefficient: coefficientInput.value
            };

            // Check if all inputs are valid
            const isValid = !Object.values(errors).some(error => error !== '');
            const isComplete = nameInput.value && 
                             examInput.value !== '' && 
                             devoirInput.value !== '';

            if (isValid && isComplete) {
                // Get the current subject index
                const subjectIndex = Array.from(subjectsContainer.children).indexOf(subjectElement);
                
                // Remove old subject data if it exists
                if (module.subjects[subjectIndex]) {
                    module.subjects.splice(subjectIndex, 1);
                }

                // Add new subject data
                const subject = new Subject(
                    nameInput.value,
                    examInput.value,
                    devoirInput.value,
                    coefficientInput.value
                );
                module.addSubject(subject);

                // Show results
                resultDiv.style.display = 'flex';
                const average = subject.calculateAverage();
                
                const averageSpan = resultDiv.querySelector('.subject-average');
                averageSpan.textContent = `${average.toFixed(2)}/20`;

                // Update module display
                this.updateModuleDisplay(moduleIndex);
            } else {
                resultDiv.style.display = 'none';
            }
        };

        inputs.forEach(input => {
            input.addEventListener('input', updateSubject);
            input.addEventListener('blur', () => {
                const errors = validateInput(input, input.value);
                showError(input, errors[input.className.split(' ')[0]]);
            });
        });
    }

    showWarning(input, message) {
        const warning = document.createElement('div');
        warning.className = 'warning-message';
        warning.textContent = message;
        
        // Position the warning
        const rect = input.getBoundingClientRect();
        warning.style.position = 'absolute';
        warning.style.top = `${rect.bottom + window.scrollY + 5}px`;
        warning.style.left = `${rect.left + window.scrollX}px`;
        
        document.body.appendChild(warning);
        
        // Remove warning after 3 seconds
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }

    deleteSubject(moduleIndex, subjectIndex) {
        const module = this.modules[moduleIndex];
        module.subjects.splice(subjectIndex, 1);
        const subjectsContainer = document.querySelector(`#module${moduleIndex} .subjects`);
        subjectsContainer.children[subjectIndex].remove();
    }

    updateModuleDisplay(moduleIndex) {
        const module = this.modules[moduleIndex];
        const moduleElement = document.getElementById(`module${moduleIndex}`);
        if (!moduleElement || !module) return;

        module.calculateAverage();

        // Update module average and status
        const moduleResult = moduleElement.querySelector('.module-result');
        const averageElement = moduleResult.querySelector('.module-average');
        averageElement.textContent = `Moyenne: ${module.average.toFixed(2)}/20`;

        // Calculate overall average
        this.calculateOverallAverage();
    }

    calculateAllModules() {
        let hasValidInput = true;
        let moduleData = [];
        
        // First collect all the data
        this.modules.forEach((module, moduleIndex) => {
            const moduleElement = document.getElementById(`module${moduleIndex}`);
            const subjects = moduleElement.querySelectorAll('.subject');
            let moduleSubjects = [];
            
            subjects.forEach(subject => {
                const name = subject.querySelector('.subject-name').value;
                const exam = parseFloat(subject.querySelector('.exam').value);
                const devoir = parseFloat(subject.querySelector('.devoir').value);
                const coefficient = parseFloat(subject.querySelector('.coefficient').value) || 1;

                if (isNaN(exam) || isNaN(devoir)) {
                    hasValidInput = false;
                    return;
                }

                moduleSubjects.push({
                    element: subject,
                    data: {
                        name: name,
                        exam: exam,
                        devoir: devoir,
                        coefficient: coefficient
                    }
                });
            });

            moduleData.push({
                element: moduleElement,
                subjects: moduleSubjects
            });
        });

        if (!hasValidInput) {
            alert('Veuillez remplir toutes les notes avant de calculer.');
            return;
        }

        // Now process the data and update the display
        moduleData.forEach((moduleInfo, moduleIndex) => {
            const module = this.modules[moduleIndex];
            module.subjects = []; // Clear existing subjects
            
            let totalWeightedScore = 0;
            let totalCoefficients = 0;

            // Process each subject
            moduleInfo.subjects.forEach(subjectInfo => {
                const { name, exam, devoir, coefficient } = subjectInfo.data;
                const subjectElement = subjectInfo.element;
                
                // Calculate subject average
                const subjectAverage = (exam * 0.6 + devoir * 0.4);
                const status = subjectAverage >= 10 ? 'VALIDÉ' : 'RATTRAPAGE';

                // Update subject display
                const resultDiv = subjectElement.querySelector('.subject-result');
                resultDiv.innerHTML = `
                    <span class="subject-average">${subjectAverage.toFixed(2)}/20</span>
                    <span class="subject-status ${status === 'VALIDÉ' ? 'success' : 'failure'}">${status}</span>
                `;

                // Add to module total
                totalWeightedScore += subjectAverage * coefficient;
                totalCoefficients += coefficient;

                // Store subject data
                const subject = new Subject(name, exam, devoir, coefficient);
                module.addSubject(subject);
            });

            // Calculate and display module average
            const moduleAverage = totalWeightedScore / totalCoefficients;
            const moduleStatus = moduleAverage >= 10 ? 'MODULE VALIDÉ' : 'MODULE NON VALIDÉ';

            const moduleResult = moduleInfo.element.querySelector('.module-result');
            moduleResult.innerHTML = `
                <div class="module-average">${moduleAverage.toFixed(2)}/20</div>
                <div class="module-status ${moduleStatus === 'MODULE VALIDÉ' ? 'success' : 'failure'}">${moduleStatus}</div>
            `;

            // Store module data
            module.average = moduleAverage;
            module.status = moduleStatus;
            module.calculated = true;
        });

        // Calculate and display overall average
        const totalModules = moduleData.length;
        if (totalModules > 0) {
            const overallAverage = moduleData.reduce((sum, moduleInfo, index) => 
                sum + this.modules[index].average, 0) / totalModules;
            document.getElementById('overallAverage').textContent = overallAverage.toFixed(2) + '/20';
            document.getElementById('resultsSummary').style.display = 'block';
        }
    }

    generatePDF() {
        try {
            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Colors
            const primaryColor = [33, 150, 243];  // Blue
            const secondaryColor = [76, 175, 80]; // Green
            const headerBg = [235, 245, 255];     // Light Blue
            const textColor = [51, 51, 51];       // Dark Gray
            
            // Set font
            doc.setFont("helvetica");
            
            // Add header with background
            doc.setFillColor(...headerBg);
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
            
            // Title
            doc.setTextColor(...primaryColor);
            doc.setFontSize(24);
            doc.text("Relevé de Notes", 105, 25, { align: "center" });
            
            // Reset text color
            doc.setTextColor(...textColor);
            
            // Add student information
            doc.setFontSize(12);
            const studentName = document.getElementById('studentName').value || 'Non spécifié';
            const studentId = document.getElementById('studentId').value || 'Non spécifié';
            
            // Student info box
            doc.setDrawColor(...primaryColor);
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(20, 45, 170, 25, 3, 3, 'FD');
            doc.text(`Nom et Prénom: ${studentName}`, 25, 55);
            doc.text(`Numéro d'Inscription: ${studentId}`, 25, 65);
            
            let yPos = 90;
            
            // Add modules and their subjects
            this.modules.forEach((module, moduleIndex) => {
                // Check if we need a new page
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                // Module header
                doc.setFillColor(...primaryColor);
                doc.setTextColor(255, 255, 255);
                doc.roundedRect(20, yPos - 5, 170, 10, 2, 2, 'F');
                doc.setFontSize(12);
                doc.text(`Module ${moduleIndex + 1}: ${module.name}`, 25, yPos);
                yPos += 15;
                
                // Table header
                doc.setFillColor(...headerBg);
                doc.setTextColor(...textColor);
                doc.rect(20, yPos - 5, 170, 8, 'F');
                
                // Column headers with specific widths
                const columns = [
                    { text: "Matière", x: 22, width: 60 },
                    { text: "Examen", x: 85, width: 25 },
                    { text: "TD", x: 112, width: 25 },
                    { text: "Coef", x: 139, width: 20 },
                    { text: "Moyenne", x: 161, width: 27 }
                ];
                
                doc.setFontSize(10);
                columns.forEach(col => {
                    doc.text(col.text, col.x, yPos);
                });
                yPos += 8;
                
                // Draw table grid
                doc.setDrawColor(200, 200, 200);
                
                // Subjects
                module.subjects.forEach((subject, index) => {
                    // Check for new page
                    if (yPos > 250) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Alternate row background
                    if (index % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(20, yPos - 5, 170, 8, 'F');
                    }
                    
                    // Draw cell borders
                    doc.line(20, yPos - 5, 20, yPos + 3);  // Left border
                    doc.line(190, yPos - 5, 190, yPos + 3); // Right border
                    columns.forEach(col => {
                        doc.line(col.x + col.width, yPos - 5, col.x + col.width, yPos + 3);
                    });
                    
                    // Subject data
                    doc.text(subject.name.substring(0, 25), 22, yPos);
                    doc.text(subject.exam.toString(), 85, yPos);
                    doc.text(subject.devoir.toString(), 112, yPos);
                    doc.text(subject.coefficient.toString(), 139, yPos);
                    
                    // Color code the average based on passing grade (10)
                    const average = subject.average.toFixed(2);
                    if (average >= 10) {
                        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
                    } else {
                        doc.setTextColor(231, 76, 60);
                    }
                    doc.text(average.toString(), 161, yPos);
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    
                    yPos += 8;
                });
                
                // Module average
                doc.setFillColor(245, 245, 245);
                doc.rect(20, yPos - 5, 170, 10, 'F');
                doc.setFontSize(11);
                const moduleAverage = module.calculateAverage().toFixed(2);
                doc.setTextColor(...primaryColor);
                doc.text(`Moyenne du Module: ${moduleAverage}`, 25, yPos + 2);
                doc.setTextColor(...textColor);
                yPos += 20;
            });
            
            // Add overall average if there are modules
            if (this.modules.length > 0) {
                const overallAverage = this.calculateOverallAverage();
                
                // Overall average box
                doc.setFillColor(...headerBg);
                doc.roundedRect(40, yPos - 5, 130, 15, 3, 3, 'F');
                doc.setFontSize(14);
                doc.setTextColor(...primaryColor);
                doc.text(`Moyenne Générale: ${overallAverage.toFixed(2)}`, 105, yPos + 5, { align: "center" });
            }
            
            // Add footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFillColor(245, 245, 245);
            doc.rect(0, pageHeight - 20, doc.internal.pageSize.width, 20, 'F');
            
            const today = new Date();
            const dateStr = today.toLocaleDateString();
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            doc.text(`Généré le ${dateStr}`, 105, pageHeight - 12, { align: "center" });
            doc.text("Développé par CHEIKH BRAHIM (MS)", 105, pageHeight - 5, { align: "center" });
            
            // Save the PDF
            doc.save("releve_notes.pdf");
            
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            alert("Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.");
        }
    }

    calculateOverallAverage() {
        const totalModules = this.modules.length;
        if (totalModules === 0) return 0;
        
        let totalWeightedScore = 0;
        let totalCoefficients = 0;

        this.modules.forEach(module => {
            const moduleAverage = module.calculateAverage();
            totalWeightedScore += moduleAverage * module.subjects.reduce((sum, subject) => sum + subject.coefficient, 0);
            totalCoefficients += module.subjects.reduce((sum, subject) => sum + subject.coefficient, 0);
        });

        return Number((totalWeightedScore / totalCoefficients).toFixed(2));
    }
}

// Initialize the application
window.academicManager = new AcademicManager();
window.academicManager.initializeEventListeners();

// Dark mode initialization
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || 
    (prefersDarkScheme.matches ? 'dark' : 'light');

// Set initial theme
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Theme toggle handler
darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button icon
    darkModeToggle.innerHTML = newTheme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
});
