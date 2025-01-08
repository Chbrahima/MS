class Module {
    constructor(name) {
        this.name = name;
        this.subjects = [];
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
            coefficient: coef
        });
    }

    calculateAverage() {
        if (this.subjects.length === 0) return 0;
        
        let totalWeightedScore = 0;
        let totalCoefficients = 0;

        this.subjects.forEach(subject => {
            const subjectAverage = (subject.exam * 0.6 + subject.devoir * 0.4);
            totalWeightedScore += subjectAverage * subject.coefficient;
            totalCoefficients += subject.coefficient;
        });

        return totalWeightedScore / totalCoefficients;
    }
}

class AcademicManager {
    constructor() {
        this.modules = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('addModule').addEventListener('click', () => this.addModule());
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDFReport());
    }

    addModule() {
        const moduleCount = this.modules.length + 1;
        const moduleName = `Module ${moduleCount}`;
        const module = new Module(moduleName);
        this.modules.push(module);
        this.renderModule(module);
        this.updateSummary();
    }

    renderModule(module) {
        const moduleSection = document.createElement('div');
        moduleSection.className = 'module-entry';
        moduleSection.innerHTML = `
            <h3>${module.name}</h3>
            <div class="subjects-list"></div>
            <div class="module-controls">
                <input type="text" placeholder="Nom de la matière" class="subject-name">
                <input type="number" placeholder="Note d'examen (0-20)" class="exam-score" min="0" max="20" step="0.25">
                <input type="number" placeholder="Note du devoir (0-20)" class="devoir-score" min="0" max="20" step="0.25">
                <input type="number" placeholder="Coefficient" class="coefficient" min="1" step="0.5">
                <button class="btn add-subject">Ajouter une Matière</button>
                <button class="delete-btn delete-module">Supprimer le Module</button>
            </div>
            <div class="module-average">Moyenne du Module: 0.00</div>
        `;

        const addSubjectBtn = moduleSection.querySelector('.add-subject');
        addSubjectBtn.addEventListener('click', () => {
            const subjectName = moduleSection.querySelector('.subject-name').value;
            const examScore = moduleSection.querySelector('.exam-score').value;
            const devoirScore = moduleSection.querySelector('.devoir-score').value;
            const coefficient = moduleSection.querySelector('.coefficient').value;

            if (subjectName && examScore && devoirScore && coefficient) {
                if (examScore > 20 || devoirScore > 20) {
                    alert('Les notes ne peuvent pas dépasser 20/20');
                    return;
                }
                
                module.addSubject(subjectName, examScore, devoirScore, coefficient);
                this.renderSubjects(module, moduleSection);
                this.updateSummary();
                
                // Clear inputs
                moduleSection.querySelector('.subject-name').value = '';
                moduleSection.querySelector('.exam-score').value = '';
                moduleSection.querySelector('.devoir-score').value = '';
                moduleSection.querySelector('.coefficient').value = '';
            } else {
                alert('Veuillez remplir tous les champs');
            }
        });

        moduleSection.querySelector('.delete-module').addEventListener('click', () => {
            this.modules = this.modules.filter(m => m !== module);
            moduleSection.remove();
            this.updateSummary();
        });

        document.getElementById('modulesSection').appendChild(moduleSection);
    }

    renderSubjects(module, moduleSection) {
        const subjectsList = moduleSection.querySelector('.subjects-list');
        subjectsList.innerHTML = '';
        
        module.subjects.forEach((subject, index) => {
            const subjectElement = document.createElement('div');
            subjectElement.className = 'subject-entry';
            subjectElement.innerHTML = `
                <p>${subject.name} - Examen: ${subject.exam}/20, Devoir: ${subject.devoir}/20, Coef: ${subject.coefficient}</p>
                <button class="delete-btn delete-subject">Supprimer</button>
            `;

            subjectElement.querySelector('.delete-subject').addEventListener('click', () => {
                module.subjects.splice(index, 1);
                this.renderSubjects(module, moduleSection);
                this.updateSummary();
            });

            subjectsList.appendChild(subjectElement);
        });

        moduleSection.querySelector('.module-average').textContent = 
            `Moyenne du Module: ${module.calculateAverage().toFixed(2)}/20`;
    }

    updateSummary() {
        const totalModules = this.modules.length;
        let overallAverage = 0;

        if (totalModules > 0) {
            const totalAverage = this.modules.reduce((sum, module) => sum + module.calculateAverage(), 0);
            overallAverage = totalAverage / totalModules;
        }

        document.getElementById('totalModules').textContent = totalModules;
        document.getElementById('overallAverage').textContent = overallAverage.toFixed(2) + '/20';
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
            doc.setFontSize(14);
            doc.text(`${module.name}`, 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(12);
            module.subjects.forEach(subject => {
                const text = `${subject.name} - Examen: ${subject.exam}/20, Devoir: ${subject.devoir}/20, Coef: ${subject.coefficient}`;
                doc.text(text, 30, yPosition);
                yPosition += 8;
            });
            
            doc.text(`Moyenne du Module: ${module.calculateAverage().toFixed(2)}/20`, 30, yPosition);
            yPosition += 15;
            
            // Add new page if needed
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
        });
        
        // Add overall summary
        doc.setFontSize(14);
        doc.text('Résumé Global', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.text(`Nombre de Modules: ${this.modules.length}`, 30, yPosition);
        yPosition += 8;
        doc.text(`Moyenne Générale: ${document.getElementById('overallAverage').textContent}`, 30, yPosition);
        
        // Save the PDF
        doc.save(`${studentName}_releve_notes.pdf`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.academicManager = new AcademicManager();
});