const USERNAME = "elouasaidi";
const PROJECT_INFO = {
  "rag-pfe": {category:"Generative AI", description:"An Agentic RAG chatbot combining hybrid retrieval, specialized agents, cross-encoder reranking and grounded answers with source citations.", tags:["Agentic RAG","LangChain","Llama 3","ChromaDB","BM25","Flask"]},
  "GPT2-LoRA-Chatbot": {category:"Generative AI", description:"Fine-tuning GPT-2 with LoRA and PEFT to build a conversational AI application, from dataset preparation to Flask deployment.", tags:["GPT-2","LoRA","PEFT","PyTorch","Hugging Face","Flask"]},
  "movie-recommendation-system": {category:"Machine Learning", description:"A hybrid movie recommendation web application using content-based techniques and user preferences across a catalogue of 10,000 TMDB movies.", tags:["Recommendation Systems","TF-IDF","KNN","Scikit-learn","Flask","MySQL"]},
  "Iris-Biometric-Authentication": {category:"Deep Learning", description:"A biometric authentication pipeline combining iris image processing, CNN feature extraction, PCA dimensionality reduction and SVM classification.", tags:["Computer Vision","CNN","PCA","SVM","OpenCV","Streamlit"]},
  "Student-Segmentation-KMeans": {category:"Machine Learning", description:"An unsupervised learning project that builds student profiles and discovers learning-behaviour segments using K-Means and PCA.", tags:["K-Means","Clustering","PCA","Scikit-learn","Pandas"]},
  "Text-Clustering-NLP": {category:"NLP", description:"An NLP workflow that transforms text into TF-IDF features and groups similar documents with K-Means, with PCA for cluster visualization.", tags:["NLP","spaCy","TF-IDF","K-Means","PCA"]},
  "Heart-Disease-Prediction-CRISP-DM": {category:"Machine Learning", description:"A cardiovascular risk prediction workflow following CRISP-DM, comparing classification models and deploying an interactive Streamlit application.", tags:["CRISP-DM","Random Forest","XGBoost","SVM","Scikit-learn","Streamlit"]},
  "Analyse-Maladies-Cardiovasculaires": {category:"Data Analytics", description:"An interactive Power BI dashboard exploring cardiovascular indicators, risk factors, trends and correlations in health data.", tags:["Power BI","Data Analytics","Dashboard","Data Visualization"]},
  "TSP-UAV": {category:"Optimization", description:"UAV trajectory optimization for sensor-data collection, comparing ACO, PSO, Genetic Algorithms and Simulated Annealing.", tags:["ACO","PSO","Genetic Algorithm","Simulated Annealing","IoT","NS-3"]},
  "Robot-Arm-SA-QLearning": {category:"Optimization", description:"A hybrid optimization experiment combining Simulated Annealing and Q-Learning to guide a two-link robotic arm toward a target.", tags:["Reinforcement Learning","Q-Learning","Simulated Annealing","Robotics","Optimization"]}
};
const grid = document.querySelector("#projects-grid");
const searchInput = document.querySelector("#project-search");
const filterList = document.querySelector("#filter-list");
const count = document.querySelector("#project-count");
let repositories = [];
let activeFilter = "All";

function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function card(repo) {
  const info = PROJECT_INFO[repo.name] || {};
  const category = info.category || repo.language || "Development";
  const description = info.description || repo.description || "Explore this project on GitHub for its source code, documentation and implementation details.";
  const tags = info.tags || [repo.language || "Code", ...(repo.topics || []).slice(0,4)];
  return `<article class="project-card">
    <div class="project-top"></div><div class="project-content">
      <span class="project-category">${escapeHTML(category)}</span>
      <h3>${escapeHTML(repo.name.replaceAll("-"," ").replaceAll("_"," "))}</h3>
      <p class="project-description">${escapeHTML(description)}</p>
      <div class="project-tags">${tags.slice(0,5).map(t=>`<span>${escapeHTML(t)}</span>`).join("")}</div>
      <div class="project-bottom"><span class="project-language">${escapeHTML(repo.language || "Multi-stack")}</span>
      <div class="project-links"><a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noreferrer">Source code <span>↗</span></a>${repo.homepage?`<a href="${escapeHTML(repo.homepage)}" target="_blank" rel="noreferrer">Live demo ↗</a>`:""}</div></div>
    </div></article>`;
}
function render() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = repositories.filter(repo => {
    const info = PROJECT_INFO[repo.name] || {};
    const category = info.category || repo.language || "Development";
    const haystack = [repo.name, repo.description, category, ...(info.tags || []), ...(repo.topics || [])].join(" ").toLowerCase();
    return (activeFilter === "All" || category === activeFilter) && haystack.includes(q);
  });
  count.textContent = filtered.length;
  grid.innerHTML = filtered.length ? filtered.map(card).join("") : `<div class="empty-state">No projects match your search. Try another keyword or category.</div>`;
}
async function loadProjects() {
  try {
    let page = 1, all = [], batch;
    do {
      const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&sort=updated&type=owner`);
      if (!response.ok) throw new Error(response.status === 403 ? "GitHub API rate limit reached. Please try again later." : "Could not load GitHub repositories.");
      batch = await response.json();
      all = all.concat(batch);
      page++;
    } while (batch.length === 100);
    repositories = all.filter(r => !r.private && !r.fork).sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
    render();
    document.querySelector("#github-note").innerHTML = `Showing all ${repositories.length} public repositories owned by ${USERNAME} · <a href="https://github.com/${USERNAME}?tab=repositories" target="_blank" rel="noreferrer">View on GitHub ↗</a>`;
  } catch (error) {
    grid.innerHTML = `<div class="empty-state">${escapeHTML(error.message)} <a href="https://github.com/${USERNAME}?tab=repositories" target="_blank" rel="noreferrer">Browse repositories ↗</a></div>`;
    document.querySelector("#github-note").textContent = "Project cards are loaded live from the public GitHub API. No GitHub token is stored in this website.";
  }
}
searchInput.addEventListener("input", render);
filterList.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  filterList.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===button));
  render();
});
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
menuButton.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");}));
document.querySelector("#year").textContent = new Date().getFullYear();
const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
const glow = document.querySelector(".cursor-glow");
window.addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px";},{passive:true});
loadProjects();
