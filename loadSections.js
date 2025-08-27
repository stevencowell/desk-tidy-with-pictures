const sections = [
  'program',
  'syllabus',
  'assessment',
  'project-unit',
  'main-theory',
  'support-activities',
  'advanced-activities'
];

const weekCounts = {
  'main-theory': 10,
  'support-activities': 10,
  'advanced-activities': 10
};

function loadSections() {
  console.log('Loading sections...');
  return Promise.all(sections.map(id => {
    return fetch('sections/' + id + '.html')
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`Failed to load ${id}: ${resp.status} ${resp.statusText}`);
        }
        return resp.text();
      })
      .then(html => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = html;
          console.log(`Loaded section: ${id}`);
        } else {
          console.error(`Element not found: ${id}`);
        }
      })
      .catch(err => {
        console.error(`Error loading section ${id}:`, err);
      });
  }));
}

async function loadWeeks() {
  console.log('Loading weeks...');
  async function fetchWeekSequential(section, count) {
    const container = document.getElementById(section + '-weeks');
    if (!container) {
      console.warn(`Container not found for ${section}-weeks`);
      return;
    }
    
    console.log(`Loading ${count} weeks for ${section}...`);
    for (let i = 1; i <= count; i++) {
      try {
        const resp = await fetch(`sections/${section}/week${i}.html`);
        if (!resp.ok) {
          console.warn(`Failed to load week ${i} for ${section}: ${resp.status}`);
          continue;
        }
        const html = await resp.text();
        const div = document.createElement('div');
        div.innerHTML = html;
        container.appendChild(div);
        console.log(`Loaded week ${i} for ${section}`);
      } catch (err) {
        console.error(`Error loading week ${i} for ${section}:`, err);
      }
    }
  }

  const promises = [];
  for (const [section, count] of Object.entries(weekCounts)) {
    promises.push(fetchWeekSequential(section, count));
  }
  return Promise.all(promises);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting to load sections and weeks...');
  loadSections()
    .then(() => {
      console.log('Sections loaded, now loading weeks...');
      return loadWeeks();
    })
    .then(() => {
      console.log('Weeks loaded, initializing page...');
      if (typeof initPage === 'function') {
        initPage();
        console.log('Page initialized');
      } else {
        console.warn('initPage function not found');
      }
      if (typeof initQuizFeatures === 'function') {
        initQuizFeatures();
        console.log('Quiz features initialized');
      } else {
        console.warn('initQuizFeatures function not found');
      }
    })
    .catch(err => {
      console.error('Error during loading:', err);
    });
});
