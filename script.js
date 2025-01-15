class Module {
    constructor(name) {
        this.name = name;
        this.subjects = [];
        this.calculated = false;
    }

    addSubject(name, exam, devoir, coefficient) {
        // Validate scores
        const examScore = Math.min(Math.max(parseFloat(exam) || 0, 0), 20);
        const devoirScore = Math.min(Math.max(parseFloat(devoir) || 0, 0), 20);
        const coef = Math.max(parseFloat(coefficient) || 1, 1);

        this.subjects.push({
            name,
            exam: examScore,
            devoir: devoirScore,
            coefficient: coef,
            average: null,
            status: null
        });
        this.calculated = false;
    }

    calculateSubjectStatus(subject) {
        const average = (subject.exam * 0.6 + subject.devoir * 0.4);
        subject.average = Number(average.toFixed(2));
        subject.status = average >= 10 ? 'VALIDÉ' : 'RATTRAPAGE';
        return average;
    }

    calculateAverage() {
        if (this.subjects.length === 0) return 0;
        
        let totalWeightedScore = 0;
        let totalCoefficients = 0;

        this.subjects.forEach(subject => {
            const subjectAverage = this.calculateSubjectStatus(subject);
            totalWeightedScore += subjectAverage * subject.coefficient;
            totalCoefficients += subject.coefficient;
        });

        this.average = Number((totalWeightedScore / totalCoefficients).toFixed(2));
        this.status = this.average >= 10 ? 'MODULE VALIDÉ' : 'MODULE NON VALIDÉ';
        this.calculated = true;
        return this.average;
    }

    needsCompensation() {
        return this.calculateAverage() < 10;
    }

    hasSubjectBelowLessaye() {
        return this.subjects.some(subject => 
            (subject.exam * 0.6 + subject.devoir * 0.4) < 5
        );
    }
}

class AcademicManager {
    constructor() {
        this.modules = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('addModule').addEventListener('click', () => this.addModule());
        document.getElementById('calculateAll').addEventListener('click', () => this.calculateAllModules());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDFReport());
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

        moduleElement.querySelector('.add-subject').addEventListener('click', () => {
            this.addSubject(this.modules.length - 1);
        });
    }

    addSubject(moduleIndex) {
        const subjectElement = document.createElement('div');
        subjectElement.className = 'subject';
        
        subjectElement.innerHTML = `
            <input type="text" class="subject-name" placeholder="Nom de la matière">
            <input type="number" class="exam" min="0" max="20" step="0.25" placeholder="Note Examen">
            <input type="number" class="devoir" min="0" max="20" step="0.25" placeholder="Note du Devoir">
            <input type="number" class="coefficient" min="1" placeholder="Crédit">
            <div class="subject-result">
                <span class="subject-average"></span>
                <span class="subject-status"></span>
            </div>
        `;

        const subjectsContainer = document.querySelector(`#module${moduleIndex} .subjects`);
        subjectsContainer.appendChild(subjectElement);

        // Add input event listeners
        const inputs = subjectElement.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const nameInput = subjectElement.querySelector('.subject-name');
                const examInput = subjectElement.querySelector('.exam');
                const devoirInput = subjectElement.querySelector('.devoir');
                const coefficientInput = subjectElement.querySelector('.coefficient');

                this.modules[moduleIndex].addSubject(
                    nameInput.value,
                    examInput.value,
                    devoirInput.value,
                    coefficientInput.value
                );
            });
        });
    }

    updateModuleDisplay(moduleIndex) {
        const module = this.modules[moduleIndex];
        const moduleElement = document.getElementById(`module${moduleIndex}`);
        if (!moduleElement || !module || !module.calculated) return;

        // Update module average and status
        const moduleResult = moduleElement.querySelector('.module-result');
        const averageElement = moduleResult.querySelector('.module-average');
        const statusElement = moduleResult.querySelector('.module-status');
        
        averageElement.textContent = `Moyenne: ${module.average.toFixed(2)}/20`;
        statusElement.textContent = module.status;
        statusElement.className = `module-status ${module.status === 'MODULE VALIDÉ' ? 'success' : 'failure'}`;

        // Update each subject's display
        const subjects = moduleElement.querySelectorAll('.subject');
        module.subjects.forEach((subject, idx) => {
            const subjectElement = subjects[idx];
            if (subjectElement) {
                const resultDiv = subjectElement.querySelector('.subject-result');
                const averageSpan = resultDiv.querySelector('.subject-average');
                const statusSpan = resultDiv.querySelector('.subject-status');

                averageSpan.textContent = `${subject.average.toFixed(2)}/20`;
                statusSpan.textContent = subject.status;
                statusSpan.className = `subject-status ${subject.status === 'VALIDÉ' ? 'success' : 'failure'}`;
            }
        });
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
                module.subjects.push({
                    name,
                    exam,
                    devoir,
                    coefficient,
                    average: subjectAverage,
                    status
                });
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

    async generatePDFReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const studentName = document.getElementById('studentName').value || 'Étudiant';
        const studentId = document.getElementById('studentId').value || 'N/A';
        
        // Add header
        doc.setFontSize(20);
        doc.text('Relevé de Notes', 105, 20, { align: 'center' });
        
        // Add student info
        doc.setFontSize(12);
        doc.text(`Nom de l'étudiant: ${studentName}`, 20, 40);
        doc.text(`Numéro d'inscription: ${studentId}`, 20, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
        
        let yPosition = 80;
        
        // Add modules and subjects
        this.modules.forEach((module, index) => {
            if (!module.calculated) return;

            // Module header
            doc.setFontSize(14);
            doc.text(`${module.name} - ${module.status}`, 20, yPosition);
            doc.text(`Moyenne: ${module.average.toFixed(2)}/20`, 150, yPosition);
            yPosition += 7;

            // Table header
            const headers = ['Matière', 'Examen', 'TD', 'Moyenne', 'Coef', 'Status'];
            const colWidths = [50, 25, 25, 25, 20, 30];
            let x = 20;
            
            headers.forEach((header, i) => {
                doc.text(header, x, yPosition);
                x += colWidths[i];
            });
            yPosition += 5;

            // Subjects
            doc.setFontSize(10);
            module.subjects.forEach(subject => {
                x = 20;
                doc.text(subject.name, x, yPosition); x += colWidths[0];
                doc.text(subject.exam.toString(), x, yPosition); x += colWidths[1];
                doc.text(subject.devoir.toString(), x, yPosition); x += colWidths[2];
                doc.text(subject.average.toString(), x, yPosition); x += colWidths[3];
                doc.text(subject.coefficient.toString(), x, yPosition); x += colWidths[4];
                doc.text(subject.status, x, yPosition);
                yPosition += 5;
            });
            yPosition += 10;

            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
        });

        // Overall average
        doc.setFontSize(14);
        const overallAvg = document.getElementById('overallAverage').textContent;
        doc.text(`Moyenne Générale: ${overallAvg}`, 105, yPosition + 10, { align: 'center' });

        doc.save('releve_notes.pdf');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.academicManager = new AcademicManager();
});
