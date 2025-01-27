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
        const moduleIndex = this.modules.length;
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module';
        moduleDiv.id = `module${moduleIndex}`;

        const moduleNameInput = document.createElement('input');
        moduleNameInput.type = 'text';
        moduleNameInput.className = 'module-name';
        moduleNameInput.placeholder = `Module ${moduleIndex + 1}`;
        
        // Create new module instance
        const newModule = new Module();
        
        // Update module name when input changes
        moduleNameInput.addEventListener('input', (e) => {
            newModule.name = e.target.value || `Module ${moduleIndex + 1}`;
        });
        
        // Store initial name
        newModule.name = `Module ${moduleIndex + 1}`;

        moduleDiv.innerHTML += `
            <div class="module-header">
                <i class="fas fa-trash-alt delete-module" title="Supprimer le module"></i>
            </div>
            <div class="subjects"></div>
            <button class="btn add-subject">Ajouter une Matière</button>
            <div class="module-result">
                <!-- Module results will be displayed here -->
            </div>
        `;

        // Move the name input into the header after setting innerHTML
        const header = moduleDiv.querySelector('.module-header');
        header.insertBefore(moduleNameInput, header.firstChild);

        document.getElementById('modulesSection').appendChild(moduleDiv);

        // Add event listener for delete module icon
        moduleDiv.querySelector('.delete-module').addEventListener('click', () => {
            this.deleteModule(moduleIndex);
        });

        moduleDiv.querySelector('.add-subject').addEventListener('click', () => {
            this.addSubject(moduleIndex);
        });

        this.modules.push(newModule);
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
        const subjectsContainer = document.querySelector(`#module${moduleIndex} .subjects`);
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject';
        
        subjectDiv.innerHTML = `
            <div class="subject-inputs">
                <div class="input-group">
                    <input type="text" class="subject-name" placeholder="Nom de la matière">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="text" class="devoir" placeholder="Note du Devoir"
                           oninput="this.value = this.value.replace(/[^0-9,\.]/g, '')">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="text" class="exam" placeholder="Note Examen" 
                           oninput="this.value = this.value.replace(/[^0-9,\.]/g, '')">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <input type="text" class="coefficient" placeholder="Crédit"
                           oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                    <span class="error-message"></span>
                </div>
            </div>
            <div class="subject-result">
                <span class="subject-average"></span>
                <span class="subject-status"></span>
            </div>
            <i class="fas fa-trash-alt delete-subject" title="Supprimer la matière"></i>
        `;

        subjectsContainer.appendChild(subjectDiv);

        // Add delete subject event listener
        const deleteButton = subjectDiv.querySelector('.delete-subject');
        deleteButton.addEventListener('click', () => {
            subjectDiv.remove();
            this.calculateModuleAverage(moduleIndex);
        });

        // Add grade input restrictions
        const gradeInputs = subjectDiv.querySelectorAll('.exam, .devoir');
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
                let value = parseFloat(e.target.value.replace(',', '.'));
                if (isNaN(value)) return;
                
                if (value > 20) {
                    e.target.value = '20';
                    this.showWarning(input, 'La note maximale est 20');
                } else if (value < 0) {
                    e.target.value = '0';
                    this.showWarning(input, 'La note minimale est 0');
                }
            });

            // Prevent paste of invalid values
            input.addEventListener('paste', (e) => {
                const pastedData = e.clipboardData.getData('text');
                const value = parseFloat(pastedData.replace(',', '.'));
                if (isNaN(value) || value < 0 || value > 20) {
                    e.preventDefault();
                    this.showWarning(input, 'Veuillez coller une note valide entre 0 et 20');
                }
            });
        });

        // Add input validation
        const inputs = subjectDiv.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateAndUpdateSubject(subjectDiv, moduleIndex);
            });

            input.addEventListener('blur', () => {
                this.validateAndUpdateSubject(subjectDiv, moduleIndex);
            });
        });
    }

    showWarning(input, message) {
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            setTimeout(() => {
                errorSpan.textContent = '';
            }, 3000);
        }
    }

    validateAndUpdateSubject(subjectDiv, moduleIndex) {
        const nameInput = subjectDiv.querySelector('.subject-name');
        const examInput = subjectDiv.querySelector('.exam');
        const devoirInput = subjectDiv.querySelector('.devoir');
        const coefficientInput = subjectDiv.querySelector('.coefficient');
        const resultDiv = subjectDiv.querySelector('.subject-result');

        // Validate inputs
        const name = nameInput.value.trim();
        const exam = parseFloat(examInput.value.replace(',', '.')) || 0;
        const devoir = parseFloat(devoirInput.value.replace(',', '.')) || 0;
        const coefficient = parseInt(coefficientInput.value) || 0;

        // Show/hide error messages
        this.validateField(nameInput, name, 'Le nom de la matière est requis', 'empty');
        this.validateField(examInput, exam, 'La note maximale est 20', 'grade');
        this.validateField(devoirInput, devoir, 'La note maximale est 20', 'grade');
        this.validateField(coefficientInput, coefficient, 'Le crédit est requis', 'empty');

        // Calculate and display average if all inputs are valid
        if (name && exam >= 0 && exam <= 20 && devoir >= 0 && devoir <= 20 && coefficient > 0) {
            const average = (exam * 0.6 + devoir * 0.4).toFixed(2);
            const status = average >= 10 ? 'VALIDÉ' : 'RATTRAPAGE';
            
            const averageSpan = resultDiv.querySelector('.subject-average');
            const statusSpan = resultDiv.querySelector('.subject-status');
            
            if (averageSpan && statusSpan) {
                averageSpan.textContent = `${average}/20`;
                statusSpan.textContent = status;
                statusSpan.className = 'subject-status ' + (status === 'VALIDÉ' ? 'success' : 'failure');
            }
        }

        // Update module average
        this.calculateModuleAverage(moduleIndex);
    }

    validateField(input, value, errorMessage, type) {
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            if (type === 'grade') {
                // Only show error for grades if value is greater than 20
                if (value > 20) {
                    errorSpan.textContent = errorMessage;
                    input.classList.add('error');
                } else {
                    errorSpan.textContent = '';
                    input.classList.remove('error');
                }
            } else if (type === 'empty') {
                // Only show error for empty required fields
                if (!value) {
                    errorSpan.textContent = errorMessage;
                    input.classList.add('error');
                } else {
                    errorSpan.textContent = '';
                    input.classList.remove('error');
                }
            }
        }
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
        let allModuleAverages = [];
        
        // First collect all the data and calculate module averages
        this.modules.forEach((module, moduleIndex) => {
            const moduleElement = document.getElementById(`module${moduleIndex}`);
            const subjects = moduleElement.querySelectorAll('.subject');
            let moduleSubjects = [];
            let totalWeightedScore = 0;
            let totalCoefficients = 0;
            let hasSubjectUnderFive = false;
            
            subjects.forEach((subject, idx) => {
                const name = subject.querySelector('.subject-name').value;
                const devoir = parseFloat(subject.querySelector('.devoir').value) || 0;
                const exam = parseFloat(subject.querySelector('.exam').value) || 0;
                const coefficient = parseFloat(subject.querySelector('.coefficient').value) || 1;

                if (isNaN(devoir) || isNaN(exam)) {
                    hasValidInput = false;
                    return;
                }

                const subjectAverage = (exam * 0.6 + devoir * 0.4);
                if (subjectAverage < 5) {
                    hasSubjectUnderFive = true;
                }

                totalWeightedScore += subjectAverage * coefficient;
                totalCoefficients += coefficient;

                moduleSubjects.push({
                    element: subject,
                    data: {
                        name: name,
                        devoir: devoir,
                        exam: exam,
                        coefficient: coefficient,
                        average: subjectAverage
                    }
                });
            });

            const moduleAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients : 0;
            allModuleAverages.push({
                index: moduleIndex,
                average: moduleAverage,
                hasSubjectUnderFive: hasSubjectUnderFive
            });

            moduleData.push({
                element: moduleElement,
                subjects: moduleSubjects,
                average: moduleAverage,
                hasSubjectUnderFive: hasSubjectUnderFive
            });
        });

        if (!hasValidInput) {
            alert('Veuillez remplir toutes les notes avant de calculer.');
            return;
        }

        // Check if any module has average < 9 and if any subject in any module has average < 5
        const hasModuleUnderNine = allModuleAverages.some(mod => mod.average < 9);
        const hasAnySubjectUnderFive = moduleData.some(mod => mod.hasSubjectUnderFive);

        // Now process each module with all conditions
        moduleData.forEach((moduleInfo, moduleIndex) => {
            const module = this.modules[moduleIndex];
            const moduleAverage = moduleInfo.average;
            
            // A module is validated if either:
            // 1. Its average is >= 10, or
            // 2. Its average is exactly 9 AND:
            //    a) No other module has average < 9 AND
            //    b) No subject in any module has average < 5
            const isModuleValidated = moduleAverage >= 10 || 
                                    (moduleAverage >= 9 && 
                                    !hasModuleUnderNine && 
                                    !hasAnySubjectUnderFive);

            const moduleStatus = isModuleValidated ? 'MODULE VALIDÉ' : 'MODULE NON VALIDÉ';

            // Update subject displays
            moduleInfo.subjects.forEach(subjectInfo => {
                const subjectElement = subjectInfo.element;
                if (subjectElement) {
                    const subjectAverage = subjectInfo.data.average;
                    // A subject is validated if either:
                    // 1. Its own average is >= 10, or
                    // 2. The module is validated (compensation)
                    const status = isModuleValidated || subjectAverage >= 10 ? 'VALIDÉ' : 'RATTRAPAGE';
                    
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

            // Update module display
            const moduleResult = moduleInfo.element.querySelector('.module-result');
            if (moduleResult) {
                moduleResult.innerHTML = `
                    <div class="module-status ${isModuleValidated ? 'success' : 'failure'}">
                        ${moduleStatus}: ${moduleAverage.toFixed(2)}
                    </div>
                `;
            }

            // Store module data
            module.average = moduleAverage;
            module.status = moduleStatus;
            module.calculated = true;
        });

        // Calculate and display overall average
        if (moduleData.length > 0) {
            let totalWeightedModuleScores = 0;
            let totalModuleCredits = 0;

            moduleData.forEach(moduleInfo => {
                // Calculate total credits (coefficients) for this module
                const moduleCredits = moduleInfo.subjects.reduce((sum, subject) => 
                    sum + (subject.data.coefficient || 1), 0);
                
                // Add to weighted sum (module average × module total credits)
                totalWeightedModuleScores += moduleInfo.average * moduleCredits;
                totalModuleCredits += moduleCredits;
            });

            // Calculate overall average: sum(module_average × module_credits) / total_credits
            const overallAverage = totalModuleCredits > 0 ? 
                totalWeightedModuleScores / totalModuleCredits : 0;
            
            // Create or update overall average display
            const generalAverageContainer = document.getElementById('general-average-container');
            let overallAverageDiv = document.getElementById('overallAverage');
            
            if (!overallAverageDiv) {
                overallAverageDiv = document.createElement('div');
                overallAverageDiv.id = 'overallAverage';
                generalAverageContainer.appendChild(overallAverageDiv);
            }
            
            overallAverageDiv.className = `general-average ${overallAverage >= 10 ? 'success' : 'failure'}`;
            overallAverageDiv.innerHTML = `
                <div class="average-value">Moyenne Générale: ${overallAverage.toFixed(2)}</div>
            `;
        }

        // Get general average from the website
        const overallAverageElement = document.getElementById('overallAverage');
        if (overallAverageElement) {
            const generalAverage = parseFloat(overallAverageElement.textContent.match(/[\d.]+/)[0]);
            const isPassingGeneral = generalAverage >= 10;

            // Draw decorative line
            doc.setDrawColor(52, 152, 219);
            doc.setLineWidth(0.5);
            doc.line(margin, y - 5, doc.internal.pageSize.width - margin, y - 5);

            // Create elegant box for general average
            doc.setFillColor(236, 240, 241);
            doc.rect(margin - 2, y, colWidths.reduce((a, b) => a + b, 0) + 4, 20, 'F');
            
            // Add general average text with appropriate color
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(isPassingGeneral ? 46 : 198, isPassingGeneral ? 125 : 40, isPassingGeneral ? 50 : 40);
            doc.text(`Moyenne Générale: ${generalAverage.toFixed(2)}`, doc.internal.pageSize.width / 2, y + 13, { align: 'center' });
        }

        // Add signature line at the bottom
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        const signature = "Par CHEIKH BRAHIM ( MS )";
        doc.text(signature, doc.internal.pageSize.width - margin - doc.getTextWidth(signature), doc.internal.pageSize.height - 20);

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save('releve_notes.pdf');
    }

    parseGrade(value) {
        // Replace comma with dot for decimal numbers
        value = value.toString().replace(',', '.');
        // Convert to number and check if it's valid
        const grade = parseFloat(value);
        return !isNaN(grade) ? grade : 0;
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
            const margin = 15;
            let y = 25;

            // Add header with gradient-like effect
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
            doc.setFillColor(52, 152, 219);
            doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');

            // Add title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.text('Relevé de Notes', doc.internal.pageSize.width / 2, 25, { align: 'center' });

            // Reset text color and move below header
            doc.setTextColor(0, 0, 0);
            y = 60;

            // Get student info
            const studentName = document.getElementById('studentName').value;
            const studentId = document.getElementById('studentId').value;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            if (studentName) {
                doc.text(`Nom et Prénom: ${studentName}`, margin, y);
                y += 10;
            }
            if (studentId) {
                doc.text(`N° d'Inscription: ${studentId}`, margin, y);
                y += 10;
            }

            // Add date
            const currentDate = new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            doc.text(`Date: ${currentDate}`, margin, y);
            y += 20;

            // Headers and content setup
            const colWidths = [50, 25, 25, 20, 30, 35];
            const headers = ['Matière', 'Devoir', 'Examen', 'Crédit', 'Moyenne', 'Status'];
            
            // Process each module
            this.modules.forEach((module, moduleIndex) => {
                // Check if we need a new page
                if (y > 250) {
                    doc.addPage();
                    y = 25;
                }

                // Get module element
                const moduleElement = document.getElementById(`module${moduleIndex}`);
                if (!moduleElement) return;

                // Module title with background
                doc.setFillColor(236, 240, 241);
                doc.rect(margin - 5, y - 5, doc.internal.pageSize.width - 2 * (margin - 5), 12, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                
                // Get module name from input
                const moduleNameInput = moduleElement.querySelector('.module-name');
                const moduleName = moduleNameInput ? moduleNameInput.value : `Module ${moduleIndex + 1}`;
                doc.text(moduleName, margin, y + 3);
                y += 20;

                // Table headers with modern styling
                doc.setFillColor(52, 152, 219);
                doc.rect(margin - 2, y - 5, colWidths.reduce((a, b) => a + b, 0) + 4, 10, 'F');
                
                let x = margin;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                headers.forEach((header, i) => {
                    doc.text(header, x, y + 2);
                    x += colWidths[i];
                });
                doc.setTextColor(0, 0, 0);
                y += 12;

                // Get all subjects from the module element
                const subjects = moduleElement.querySelectorAll('.subject');
                subjects.forEach((subject, idx) => {
                    // Get subject data from the actual form fields
                    const name = subject.querySelector('.subject-name').value;
                    const devoir = parseFloat(subject.querySelector('.devoir').value) || 0;
                    const exam = parseFloat(subject.querySelector('.exam').value) || 0;
                    const coefficient = parseFloat(subject.querySelector('.coefficient').value) || 1;
                    const average = (exam * 0.6 + devoir * 0.4).toFixed(2);
                    
                    // Get the actual status from the website
                    const resultDiv = subject.querySelector('.subject-result');
                    const statusDiv = resultDiv ? resultDiv.querySelector('.subject-status') : null;
                    const status = statusDiv ? 
                        (statusDiv.classList.contains('success') ? 'VALIDÉ' : 'RATTRAPAGE') : 
                        (average >= 10 ? 'VALIDÉ' : 'RATTRAPAGE');

                    // Alternate row colors
                    if (idx % 2 === 0) {
                        doc.setFillColor(245, 247, 250);
                        doc.rect(margin - 2, y - 5, colWidths.reduce((a, b) => a + b, 0) + 4, 10, 'F');
                    }

                    // Draw each cell
                    x = margin;
                    doc.setFont('helvetica', 'normal');
                    [name, devoir.toString(), exam.toString(), coefficient.toString(), average, status]
                        .forEach((value, i) => {
                            if (i === 5) {
                                doc.setTextColor(status === 'VALIDÉ' ? 46 : 198, 
                                               status === 'VALIDÉ' ? 125 : 40, 
                                               status === 'VALIDÉ' ? 50 : 40);
                                doc.setFont('helvetica', 'bold');
                            }
                            doc.text(value || '-', x, y + 2);
                            if (i === 5) {
                                doc.setTextColor(0, 0, 0);
                                doc.setFont('helvetica', 'normal');
                            }
                            x += colWidths[i];
                        });
                    y += 10;
                });

                // Get module result from the website
                const moduleResult = moduleElement.querySelector('.module-result');
                const moduleStatus = moduleResult ? moduleResult.querySelector('.module-status') : null;
                const isValidated = moduleStatus ? moduleStatus.classList.contains('success') : false;
                
                // Get the exact module average from the website display
                let moduleAverage = '';
                if (moduleStatus) {
                    const statusText = moduleStatus.textContent;
                    const match = statusText.match(/:\s*([\d.]+)/);
                    if (match) {
                        moduleAverage = match[1];
                    }
                }
                
                const moduleStatusText = isValidated ? 'MODULE VALIDÉ' : 'MODULE NON VALIDÉ';

                // Draw module result box
                y += 5;
                doc.setFillColor(236, 240, 241);
                doc.rect(margin - 2, y - 5, colWidths.reduce((a, b) => a + b, 0) + 4, 15, 'F');
                
                // Module status text
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(isValidated ? 46 : 198, isValidated ? 125 : 40, isValidated ? 50 : 40);
                doc.text(`${moduleStatusText}: ${moduleAverage}`, margin, y + 4);
                doc.setTextColor(0, 0, 0);

                y += 25;
            });

            // Get general average from the website
            const overallAverageElement = document.getElementById('overallAverage');
            if (overallAverageElement) {
                const generalAverage = parseFloat(overallAverageElement.textContent.match(/[\d.]+/)[0]);
                const isPassingGeneral = generalAverage >= 10;

                // Draw decorative line
                doc.setDrawColor(52, 152, 219);
                doc.setLineWidth(0.5);
                doc.line(margin, y - 5, doc.internal.pageSize.width - margin, y - 5);

                // Create elegant box for general average
                doc.setFillColor(236, 240, 241);
                doc.rect(margin - 2, y, colWidths.reduce((a, b) => a + b, 0) + 4, 20, 'F');
                
                // Add general average text with appropriate color
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(isPassingGeneral ? 46 : 198, isPassingGeneral ? 125 : 40, isPassingGeneral ? 50 : 40);
                doc.text(`Moyenne Générale: ${generalAverage.toFixed(2)}`, doc.internal.pageSize.width / 2, y + 13, { align: 'center' });
            }

            // Add signature line at the bottom
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            const signature = "Par CHEIKH BRAHIM ( MS )";
            doc.text(signature, doc.internal.pageSize.width - margin - doc.getTextWidth(signature), doc.internal.pageSize.height - 20);

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }

            doc.save('releve_notes.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
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
