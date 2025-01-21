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
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
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
                    <input type="text" class="exam" placeholder="Note Examen" 
                           oninput="this.value = this.value.replace(/[^0-9,\.]/g, '')">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="text" class="devoir" placeholder="Note du Devoir"
                           oninput="this.value = this.value.replace(/[^0-9,\.]/g, '')">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="text" class="coefficient" min="1" value="" placeholder="Crédit"
                           oninput="this.value = this.value.replace(/[^0-9]/g, '')">
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
                let value = this.parseGrade(e.target.value);
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
                const value = this.parseGrade(pastedData);
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
                    const numValue = this.parseGrade(value);
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
                    this.parseGrade(examInput.value),
                    this.parseGrade(devoirInput.value),
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

    parseGrade(value) {
        // Replace comma with dot for decimal numbers
        value = value.toString().replace(',', '.');
        // Convert to number and check if it's valid
        const grade = parseFloat(value);
        return !isNaN(grade) ? grade : 0;
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
                const exam = this.parseGrade(subject.querySelector('.exam').value);
                const devoir = this.parseGrade(subject.querySelector('.devoir').value);
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
                
                const resultDiv = subjectElement.querySelector('.subject-result');
                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div class="subject-status ${subjectAverage >= 10 ? 'success' : 'failure'}">
                            Moyenne: ${subjectAverage.toFixed(2)}/20
                        </div>
                    `;
                }

                // Add subject data to module
                const subject = new Subject(
                    name,
                    exam,
                    devoir,
                    coefficient
                );
                module.addSubject(subject);

                // Update total weighted score and coefficients
                totalWeightedScore += subjectAverage * coefficient;
                totalCoefficients += coefficient;
            });

            // Calculate and display module average
            const moduleAverage = totalWeightedScore / totalCoefficients;
            const moduleStatus = moduleAverage >= 10 ? 'MODULE VALIDÉ' : 'MODULE NON VALIDÉ';
            const isModulePassed = moduleAverage >= 10;

            // Update all subject statuses based on their individual averages
            moduleInfo.subjects.forEach(subjectInfo => {
                const subjectElement = subjectInfo.element;
                if (subjectElement) {
                    const subjectAverage = (subjectInfo.data.exam * 0.6 + subjectInfo.data.devoir * 0.4);
                    
                    // If module is passed, all subjects are VALIDÉ (compensated)
                    // If module is not passed, only subjects with average >= 10 are VALIDÉ
                    const status = isModulePassed || subjectAverage >= 10 ? 'VALIDÉ' : 'RATTRAPAGE';
                    
                    const resultDiv = subjectElement.querySelector('.subject-result');
                    if (resultDiv) {
                        resultDiv.innerHTML = `
                            <div class="subject-status ${status === 'VALIDÉ' ? 'success' : 'failure'}">
                                ${status}: ${subjectAverage.toFixed(2)}
                            </div>
                        `;
                    }
                }
            });

            const moduleResult = moduleInfo.element.querySelector('.module-result');
            moduleResult.innerHTML = `
                <div class="module-average ${moduleAverage >= 10 ? 'success' : 'failure'}">
                    Moyenne: ${moduleAverage.toFixed(2)}
                </div>
                <div class="module-status ${moduleAverage >= 10 ? 'success' : 'failure'}">
                    ${moduleStatus}
                </div>
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

    calculateRattrapageNeeded(exam, devoir) {
        // TD (devoir) is 40% and Exam is 60% of final grade
        // To pass, need final grade of 10
        // In rattrapage, only the exam grade changes
        // 10 = (newExam * 0.6) + (devoir * 0.4)
        // Solve for newExam:
        // newExam = (10 - (devoir * 0.4)) / 0.6
        const neededGrade = (10 - (devoir * 0.4)) / 0.6;
        return Math.ceil(neededGrade * 100) / 100; // Round up to 2 decimal places
    }

    updateSubjectDisplay(subjectElement, exam, devoir, coefficient) {
        if (subjectElement) {
            // Calculate subject average
            const subjectAverage = (exam * 0.6 + devoir * 0.4);
            
            const resultDiv = subjectElement.querySelector('.subject-result');
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="subject-status ${subjectAverage >= 10 ? 'success' : 'failure'}">
                        Moyenne: ${subjectAverage.toFixed(2)}/20
                    </div>
                `;
            }
        }
    }

    generatePDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const margin = 20;
            let y = 20;

            // Add header
            doc.setFontSize(18);
            doc.text('Relevé de Notes', 105, y, { align: 'center' });
            y += 20;

            // Add student info
            const studentName = document.getElementById('studentName').value;
            const studentId = document.getElementById('studentId').value;
            
            doc.setFontSize(12);
            if (studentName) {
                doc.text(`Nom et Prénom: ${studentName}`, margin, y);
                y += 10;
            }
            if (studentId) {
                doc.text(`N° d'Inscription: ${studentId}`, margin, y);
                y += 10;
            }
            y += 10;

            // For each module
            this.modules.forEach((module, index) => {
                // Check if we need a new page
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                // Module header
                doc.setFillColor(33, 150, 243);
                doc.rect(margin, y - 5, 170, 10, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text(`Module: ${module.name}`, margin + 5, y + 3);
                doc.setTextColor(0, 0, 0);
                y += 15;

                // Table headers
                const headers = ['Matière', 'Examen', 'Devoir', 'Coef', 'Moyenne', 'Status'];
                const colWidths = [60, 20, 20, 20, 25, 25];
                let x = margin;

                // Draw header background
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, y - 5, 170, 8, 'F');

                // Draw headers
                headers.forEach((header, i) => {
                    doc.text(header, x + 2, y + 2);
                    x += colWidths[i];
                });
                y += 10;

                // Draw subjects
                module.subjects.forEach((subject, idx) => {
                    // Alternate row background
                    if (idx % 2 === 0) {
                        doc.setFillColor(249, 249, 249);
                        doc.rect(margin, y - 5, 170, 8, 'F');
                    }

                    x = margin;
                    const average = (subject.exam * 0.6 + subject.devoir * 0.4).toFixed(2);
                    const status = 'VALIDÉ';
                    
                    // Draw each cell
                    [
                        subject.name,
                        subject.exam.toString(),
                        subject.devoir.toString(),
                        subject.coefficient.toString(),
                        average.toString(),
                        status
                    ].forEach((value, i) => {
                        // Set color for status
                        if (i === 5) {
                            doc.setTextColor(46, 125, 50);  // Green for VALIDÉ
                        }
                        doc.text(value, x + 2, y + 2);
                        if (i === 5) {
                            doc.setTextColor(0, 0, 0);  // Reset to black
                        }
                        x += colWidths[i];
                    });
                    y += 8;
                });

                // Module average
                y += 5;
                const moduleAverage = module.calculateAverage().toFixed(2);
                const moduleStatus = module.status;

                // Draw average background
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, y - 5, 170, 8, 'F');

                // Draw average and status
                doc.text(`Moyenne du Module: ${moduleAverage}`, margin + 2, y + 2);
                doc.setTextColor(46, 125, 50);  // Green for VALIDÉ
                doc.text(moduleStatus, margin + 100, y + 2);
                doc.setTextColor(0, 0, 0);  // Reset to black

                y += 20;
            });

            // Save the PDF
            doc.save('releve_notes.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Une erreur est survenue lors de la génération du PDF');
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
