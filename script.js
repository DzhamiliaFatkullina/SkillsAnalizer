document.addEventListener('DOMContentLoaded', function() {
    // Load data from JSON files
    Promise.all([
        fetch('top_skills.json').then(res => res.json()),
        fetch('skills_by_category.json').then(res => res.json()),
        fetch('filtered_pairings.json').then(res => res.json())
    ]).then(([topSkillsData, skillsByCategoryData, skillPairings]) => {
        // Transform data to match expected formats
        const topSkills = topSkillsData.top_20_skills;
        
        // Transform skills by category to include both names and counts
        const skillsByCategory = {};
        for (const category in skillsByCategoryData) {
            skillsByCategory[category] = {
                total_skills: skillsByCategoryData[category].total_skills,
                unique_skills: skillsByCategoryData[category].unique_skills,
                skills: Object.keys(skillsByCategoryData[category].skills),
                skillCounts: skillsByCategoryData[category].skills
            };
        }
        
        // Initialize dashboard with all pairings (including those with 3 skills)
        initDashboard(topSkills, skillsByCategory, skillPairings);
    }).catch(error => {
        console.error('Error loading data:', error);
        alert('Failed to load data. Check console for details.');
    });
});

function initDashboard(topSkills, skillsByCategory, skillPairings) {
    console.log('Dashboard initialized with:', {
        topSkills, 
        skillsByCategory, 
        skillPairings
    });

    // Calculate statistics for the info banner
    let totalUniqueSkills = 0;
    let totalSkillMentions = 0;
    const citiesCovered = 3; // Moscow, Kazan, St. Petersburg
    const jobPostingsAnalyzed = 2400;
    
    for (const category in skillsByCategory) {
        totalUniqueSkills += skillsByCategory[category].unique_skills;
        totalSkillMentions += skillsByCategory[category].total_skills;
    }
    
    // Update the info banner statistics
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = jobPostingsAnalyzed.toLocaleString();
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = citiesCovered;
    document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = totalUniqueSkills.toLocaleString();
    document.querySelector('.stat-item:nth-child(4) .stat-value').textContent = totalSkillMentions.toLocaleString();

    // Calculate and display totals in the dashboard
    let totalSkills = 0;
    let uniqueSkills = new Set();
    
    for (const category in skillsByCategory) {
        totalSkills += skillsByCategory[category].total_skills;
        skillsByCategory[category].skills.forEach(skill => uniqueSkills.add(skill));
    }
    
    document.getElementById('total-skills').textContent = totalSkills.toLocaleString();
    document.getElementById('unique-skills').textContent = uniqueSkills.size.toLocaleString();
    
    // Create charts with error handling
    try {
        createTopSkillsChart(topSkills.slice(0, 20)); // Only show top 20 skills
        createCategoryChart(skillsByCategory);
        createPairingsChart(skillPairings);
    } catch (error) {
        console.error('Error creating charts:', error);
        alert('Failed to initialize charts. Check console for details.');
    }
    
    // Set up smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Set up intersection observer for section animations
    setupIntersectionObserver();

    // Add loading state removal
    const loadingElement = document.getElementById('loading-message');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function createTopSkillsChart(data) {
    const ctx = document.getElementById('topSkillsChart').getContext('2d');
    
    // Take only top 20 skills
    const top20 = data.slice(0, 20);
    const labels = top20.map(item => item.skill);
    const counts = top20.map(item => item.count);
    
    // Generate a gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(67, 97, 238, 0.8)');
    gradient.addColorStop(1, 'rgba(63, 55, 201, 0.8)');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Job Postings',
                data: counts,
                backgroundColor: gradient,
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(72, 149, 239, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} job postings`;
                        }
                    }
                }
            }
        }
    });
}

function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categories = Object.keys(data);
    const counts = categories.map(cat => data[cat].unique_skills);
    
    // Generate vibrant colors
    const backgroundColors = [
        'rgba(67, 97, 238, 0.7)',
        'rgba(72, 149, 239, 0.7)',
        'rgba(76, 201, 240, 0.7)',
        'rgba(86, 11, 173, 0.7)',
        'rgba(247, 37, 133, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    
    const hoverColors = [
        'rgba(67, 97, 238, 1)',
        'rgba(72, 149, 239, 1)',
        'rgba(76, 201, 240, 1)',
        'rgba(86, 11, 173, 1)',
        'rgba(247, 37, 133, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    
    const categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverColors,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const category = context.label;
                            const skills = data[category].skillCounts;
                            let tooltip = `${category}: ${context.raw} unique skills\n`;
                            tooltip += `Total mentions: ${data[category].total_skills}\n\n`;
                            
                            // Show top 5 skills in this category
                            const topSkills = Object.entries(skills)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5);
                                
                            topSkills.forEach(([skill, count]) => {
                                tooltip += `${skill}: ${count}\n`;
                            });
                            
                            return tooltip;
                        }
                    }
                }
            },
            onClick: function(evt, elements) {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const category = this.data.labels[index];
                    
                    // Get top 3 skills by count in this category
                    const topSkills = Object.entries(data[category].skillCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([skill]) => skill);
                    
                    updateCategoryDetails(category, topSkills, data[category].skillCounts);
                    
                    // Highlight the selected segment
                    const meta = this.getDatasetMeta(0);
                    meta.data.forEach((segment, i) => {
                        if (i === index) {
                            segment.options.borderWidth = 3;
                            segment.options.borderColor = '#000';
                        } else {
                            segment.options.borderWidth = 1;
                            segment.options.borderColor = '#fff';
                            segment.options.backgroundColor = segment.options.backgroundColor.replace('0.7', '0.3');
                        }
                    });
                    this.update();
                }
            }
        }
    });
    
    // Initialize with the first category
    if (categories.length > 0) {
        const firstCategory = categories[0];
        const topSkills = Object.entries(data[firstCategory].skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([skill]) => skill);
        updateCategoryDetails(firstCategory, topSkills, data[firstCategory].skillCounts);
    }
}

function updateCategoryDetails(category, topSkills, skillCounts) {
    document.getElementById('selected-category').textContent = category;
    
    const skillsList = document.getElementById('top-skills-list');
    skillsList.innerHTML = '';
    
    topSkills.forEach((skill, index) => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        
        // Add count if available
        const count = skillCounts[skill] ? ` (${skillCounts[skill]})` : '';
        skillItem.textContent = `${skill}${count}`;
        
        skillItem.style.animationDelay = `${index * 0.1}s`;
        skillItem.classList.add('fade-in');
        skillsList.appendChild(skillItem);
    });
}

function createPairingsChart(data) {
    const container = document.getElementById('pairingsChart');
    container.innerHTML = '';
    
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    
    // Create SVG with margin
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto; background: #f8f9fa; border-radius: 8px;');
    
    // Process all pairings
    const nodes = [];
    const links = [];
    const skillCounts = {};
    
    data.forEach(pair => {
        pair.skills.forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + pair.count;
        });
        
        // Create links for all combinations in multi-skill pairings
        for (let i = 0; i < pair.skills.length; i++) {
            for (let j = i + 1; j < pair.skills.length; j++) {
                links.push({
                    source: pair.skills[i],
                    target: pair.skills[j],
                    value: pair.count,
                    originalPair: pair.skills
                });
            }
        }
    });
    
    // Create nodes from all skills
    for (const skill in skillCounts) {
        nodes.push({
            id: skill,
            value: skillCounts[skill],
            name: skill
        });
    }
    
    // Sort nodes by value and take top 25 to keep visualization manageable
    const topNodes = nodes.sort((a, b) => b.value - a.value).slice(0, 25);
    const topNodeIds = new Set(topNodes.map(d => d.id));
    
    // Filter links to only include top nodes
    const topLinks = links.filter(d => 
        topNodeIds.has(d.source) && topNodeIds.has(d.target)
    );
    
    // Color scale using your site's color palette
    const colorScale = d3.scaleOrdinal()
        .domain(topNodes.map(d => d.id))
        .range([
            'rgba(72, 149, 239, 1)',
        'rgba(76, 201, 240, 1)',
        'rgba(247, 37, 133, 1)',
        'rgba(255, 159, 64, 1)'
        ]);

    // Create a simulation with boundary forces
    const simulation = d3.forceSimulation(topNodes)
        .force('link', d3.forceLink(topLinks).id(d => d.id).distance(150)) // Increased distance
        .force('charge', d3.forceManyBody().strength(-400)) // Stronger repulsion
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.value) * 1.5 + 15)) // Larger collision radius
        .force('x', d3.forceX(width / 2).strength(0.1))
        .force('y', d3.forceY(height / 2).strength(0.1))
        .force('boundary', () => {
            topNodes.forEach(node => {
                // Keep nodes within bounds with some margin
                const radius = Math.sqrt(node.value) * 1.2;
                node.x = Math.max(radius, Math.min(width - radius, node.x));
                node.y = Math.max(radius, Math.min(height - radius, node.y));
            });
        });
    
    // Create links
    const link = svg.append('g')
        .selectAll('line')
        .data(topLinks)
        .join('line')
        .attr('stroke', 'rgba(195, 208, 252, 0.4)')
        .attr('stroke-width', d => Math.sqrt(d.value) / 2) // Thicker lines
        .attr('stroke-linecap', 'round');
    
    // Create node groups (circle + text)
    const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(topNodes)
        .join('g')
        .call(drag(simulation));
    
    // Add circles to node groups - much larger now
    nodeGroups.append('circle')
        .attr('r', d => Math.sqrt(d.value) * 1.2) // Larger circles
        .attr('fill', d => colorScale(d.id))
        // .attr('stroke', '#fff')
        // .attr('stroke-width', 2)
        .attr('opacity', 0.9);
    
    // Add text labels to node groups - improved readability
    nodeGroups.append('text')
        .attr('dy', 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', d => Math.min(16, Math.sqrt(d.value)*1.2)) // Larger text
        .attr('font-weight', '600')
        .attr('fill', '#000') // Black text
        // .attr('stroke', 'rgba(255,255,255,0.7)')
        // .attr('stroke-width', '2px')
        // .attr('paint-order', 'stroke')
        .text(d => d.id)
        .append('title')
        .text(d => d.id); // Full name in tooltip
    
    // Add tooltips for nodes
    nodeGroups.append('title')
        .text(d => `${d.id}\nAppears in ${d.value} pairings`);
    
    // Add tooltips for links (pairings)
    link.append('title')
        .text(d => {
            const originalSkills = d.originalPair.join(', ');
            return `Pairing: ${originalSkills}\nCount: ${d.value}`;
        });
    
    // Update positions on each tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        nodeGroups
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag behavior
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
}
    
    // Drag behavior
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    // Drag behavior
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }

function setupSmoothScrolling() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
                
                // Smooth scroll to section
                window.scrollTo({
                    top: targetSection.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupIntersectionObserver() {
    const sections = document.querySelectorAll('.dashboard-section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}