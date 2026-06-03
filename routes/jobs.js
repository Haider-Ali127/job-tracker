const fs = require("fs");
const path = require("path");
const Job = require("../models/Job");
const CV = require("../models/cv");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, "uploads/"); },
    filename: function (req, file, cb) { cb(null, Date.now() + "-" + file.originalname); }
});
const upload = multer({ storage: storage });

async function extractTextFromPDF(filePath) {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
    }
    return fullText;
}

// ============================================================
// CAREER PATHS
// ============================================================
const careerPaths = {
    "Frontend Developer": {
        emoji: "🎨",
        description: "Builds the visual side of websites and apps that users see and interact with.",
        requiredSkills: ["html", "css", "javascript", "react", "vue", "angular", "typescript", "sass", "bootstrap", "tailwind", "figma", "nextjs", "next.js"],
        learnNext: ["react", "typescript", "tailwind", "nextjs", "figma", "sass"]
    },
    "Backend Developer": {
        emoji: "⚙️",
        description: "Builds server-side logic, databases, and APIs that power applications.",
        requiredSkills: ["node", "nodejs", "express", "python", "django", "flask", "fastapi", "java", "spring", "php", "laravel", "mongodb", "mysql", "postgresql", "redis", "rest", "restful", "graphql"],
        learnNext: ["nodejs", "express", "mongodb", "postgresql", "docker", "rest api"]
    },
    "Full Stack Developer": {
        emoji: "🚀",
        description: "Works on both frontend and backend — the complete web development package.",
        requiredSkills: ["html", "css", "javascript", "react", "node", "nodejs", "express", "mongodb", "mysql", "postgresql", "git", "rest", "restful"],
        learnNext: ["typescript", "docker", "aws", "graphql", "nextjs", "redis"]
    },
    "AI / ML Engineer": {
        emoji: "🤖",
        description: "Builds intelligent systems, machine learning models, and AI-powered applications.",
        requiredSkills: ["python", "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "data science", "keras", "deep learning", "nlp", "computer vision"],
        learnNext: ["python", "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "deep learning"]
    },
    "Data Scientist": {
        emoji: "📊",
        description: "Analyzes large datasets to find insights, trends, and build predictive models.",
        requiredSkills: ["python", "data science", "pandas", "numpy", "machine learning", "sql", "mysql", "postgresql", "matplotlib", "excel", "data analyst"],
        learnNext: ["python", "pandas", "numpy", "sql", "machine learning", "tableau", "statistics"]
    },
    "DevOps Engineer": {
        emoji: "🛠️",
        description: "Manages infrastructure, automates deployments, and keeps systems running smoothly.",
        requiredSkills: ["docker", "kubernetes", "linux", "aws", "azure", "git", "github", "jenkins", "terraform", "ansible", "bash"],
        learnNext: ["docker", "kubernetes", "linux", "aws", "ci/cd", "terraform", "jenkins"]
    },
    "Cloud Engineer": {
        emoji: "☁️",
        description: "Designs and manages cloud infrastructure on AWS, Azure, or Google Cloud.",
        requiredSkills: ["aws", "azure", "google cloud", "docker", "kubernetes", "linux", "terraform"],
        learnNext: ["aws", "azure", "docker", "kubernetes", "terraform", "linux", "networking"]
    },
    "Mobile Developer": {
        emoji: "📱",
        description: "Builds mobile applications for iOS and Android platforms.",
        requiredSkills: ["react native", "flutter", "android", "ios", "swift", "kotlin", "dart"],
        learnNext: ["react native", "flutter", "swift", "kotlin", "firebase", "typescript"]
    },
    "Cybersecurity Engineer": {
        emoji: "🔐",
        description: "Protects systems and networks from digital attacks and security threats.",
        requiredSkills: ["linux", "networking", "security", "python", "bash", "encryption", "penetration testing", "ethical hacking"],
        learnNext: ["linux", "networking", "python", "ethical hacking", "penetration testing", "encryption"]
    },
    "Database Administrator": {
        emoji: "🗄️",
        description: "Manages, optimizes, and secures databases for organizations.",
        requiredSkills: ["mysql", "postgresql", "mongodb", "sqlite", "redis", "database administration", "sql", "oracle", "data entry"],
        learnNext: ["postgresql", "mysql", "mongodb", "redis", "sql optimization", "aws rds"]
    },
    "UI/UX Designer": {
        emoji: "✏️",
        description: "Designs beautiful, user-friendly interfaces and experiences.",
        requiredSkills: ["figma", "photoshop", "css", "html", "bootstrap", "tailwind", "sass", "adobe xd"],
        learnNext: ["figma", "adobe xd", "user research", "prototyping", "css animations", "tailwind"]
    },
    "Data Entry / Admin": {
        emoji: "📋",
        description: "Handles data management, office tasks, and administrative operations.",
        requiredSkills: ["data entry", "excel", "office management", "database administration", "data analyst", "microsoft office"],
        learnNext: ["excel advanced", "sql", "python automation", "power bi", "data analysis"]
    }
};

const skillsList = [
    "office management", "database administration", "data entry", "data analyst",
    "javascript", "python", "java", "typescript", "c++", "c#", "php", "ruby", "swift", "kotlin", "go", "rust", "dart",
    "react", "angular", "vue", "html", "css", "sass", "bootstrap", "tailwind", "nextjs", "next.js", "redux", "webpack",
    "node", "nodejs", "node.js", "express", "django", "flask", "spring", "laravel", "fastapi",
    "mongodb", "mysql", "postgresql", "sqlite", "redis", "firebase", "oracle",
    "docker", "kubernetes", "aws", "azure", "google cloud", "git", "github", "linux", "bash", "jenkins", "terraform", "ansible",
    "react native", "flutter", "android", "ios",
    "graphql", "rest", "restful", "machine learning", "tensorflow", "pytorch", "keras",
    "data science", "pandas", "numpy", "figma", "photoshop", "excel", "adobe xd",
    "deep learning", "neural network", "nlp", "computer vision", "matplotlib",
    "networking", "security", "encryption", "penetration testing", "ethical hacking",
    "microsoft office", "sql", "jupyter", "tableau", "power bi"
];

function analyzeCareerPaths(foundSkills) {
    const lowerSkills = foundSkills.map(s => s.toLowerCase());
    const results = [];
    for (const [careerName, careerData] of Object.entries(careerPaths)) {
        const matchedSkills = careerData.requiredSkills.filter(skill =>
            lowerSkills.some(s => s.includes(skill) || skill.includes(s))
        );
        const missingSkills = careerData.learnNext.filter(skill =>
            !lowerSkills.some(s => s.includes(skill) || skill.includes(s))
        );
        const matchPercentage = Math.round((matchedSkills.length / careerData.requiredSkills.length) * 100);
        if (matchedSkills.length > 0) {
            results.push({
                career: careerName,
                emoji: careerData.emoji,
                description: careerData.description,
                matchPercentage,
                matchedSkills,
                missingSkills: missingSkills.slice(0, 4),
                level: matchPercentage >= 70 ? "Strong Match" : matchPercentage >= 40 ? "Good Match" : "Partial Match"
            });
        }
    }
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return results.slice(0, 4);
}

// ============================================================
// JOB ROUTES
// ============================================================

// ✅ Add Job — now includes skills
router.post("/api/add-job", async (req, res) => {
    try {
        const { company, role, skills } = req.body;
        if (!company || !role) return res.status(400).json({ message: "Company and role are required" });

        // Convert skills string to array
        const skillsArray = skills
            ? skills.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 0)
            : [];

        const newJob = new Job({ company, role, skills: skillsArray });
        await newJob.save();
        console.log("Saved job:", newJob);
        res.json({ message: "Job added successfully", job: newJob });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error saving job" });
    }
});

// Get All Jobs
router.get("/api/jobs", async (req, res) => {
    try {
        const allJobs = await Job.find().sort({ createdAt: -1 });
        res.json(allJobs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
});

// Get Single Job
router.get("/api/job/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: "Error fetching job" });
    }
});

// ✅ Update Job — now includes skills
router.put("/api/update-job/:id", async (req, res) => {
    try {
        const { company, role, skills } = req.body;
        if (!company || !role) return res.status(400).json({ message: "Company and role are required" });

        const skillsArray = skills
            ? skills.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 0)
            : [];

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { company, role, skills: skillsArray },
            { new: true, runValidators: true }
        );

        if (!updatedJob) return res.status(404).json({ message: "Job not found" });

        console.log("Updated job:", updatedJob);
        res.json({ message: "Job updated successfully", job: updatedJob });
    } catch (err) {
        console.log("Update error:", err);
        res.status(500).json({ message: "Error updating job" });
    }
});

// Delete Job
router.delete("/api/delete-job/:id", async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting job" });
    }
});

// ============================================================
// CV UPLOAD — matches against job skills field too
// ============================================================
router.post("/api/upload-cv", upload.single("cv"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file uploaded");
        const filePath = req.file.path;
        let text = "";
        try {
            text = await extractTextFromPDF(filePath);
        } catch (parseErr) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: "Could not read PDF.", error: parseErr.message });
        }

        console.log("====== CV TEXT START ======");
        console.log(text);
        console.log("====== CV TEXT END ======");

        if (!text || text.trim().length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: "PDF appears empty or scanned." });
        }

        const lowerText = text.toLowerCase();
        let foundSkills = [];
        skillsList.forEach(skill => { if (lowerText.includes(skill)) foundSkills.push(skill); });
        foundSkills = [...new Set(foundSkills)];
        console.log("Skills Found:", foundSkills);

        // ✅ IMPROVED JOB MATCHING — uses job skills field
        const allJobs = await Job.find();
        let matchedJobs = [];

        allJobs.forEach(job => {
            let matchCount = 0;
            let totalToMatch = 0;

            // Match against job skills array (primary matching)
            if (job.skills && job.skills.length > 0) {
                totalToMatch = job.skills.length;
                job.skills.forEach(jobSkill => {
                    const matched = foundSkills.some(cvSkill =>
                        cvSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
                        jobSkill.toLowerCase().includes(cvSkill.toLowerCase())
                    );
                    if (matched) matchCount++;
                });
            } else {
                // Fallback: match against role text if no skills defined
                const jobWords = (job.role + " " + job.company).toLowerCase().split(/[\s,\/\-]+/).filter(w => w.length > 2);
                totalToMatch = jobWords.length;
                jobWords.forEach(word => {
                    if (foundSkills.some(s => s.toLowerCase().includes(word) || word.includes(s.toLowerCase()))) {
                        matchCount++;
                    }
                });
            }

            if (matchCount > 0 && totalToMatch > 0) {
                const matchPercentage = Math.min(100, Math.round((matchCount / totalToMatch) * 100));
                matchedJobs.push({
                    ...job._doc,
                    matchScore: matchCount,
                    matchPercentage
                });
            }
        });

        matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
        matchedJobs = matchedJobs.slice(0, 3);

        const careerAnalysis = analyzeCareerPaths(foundSkills);
        console.log("Career Paths:", careerAnalysis.map(c => `${c.career}: ${c.matchPercentage}%`));

        fs.unlinkSync(filePath);
        await CV.create({ extractedText: text, skills: foundSkills, recommendedJobs: matchedJobs });

        res.json({
            message: "CV processed",
            skills: foundSkills,
            recommendedJobs: matchedJobs,
            careerAnalysis
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Error parsing CV");
    }
});

router.get("/api/cv-history", async (req, res) => {
    try {
        const data = await CV.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).send("Error fetching history");
    }
});

module.exports = router;
