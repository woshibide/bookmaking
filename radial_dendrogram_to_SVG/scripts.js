let debugMode = true;

const pathToCSV = "for_Rewire_design_team-data_set.csv";

const CONFIG = {
    colors: {
        nodeParent: "#555",
        nodeLeaf: "#999",
        link: "#555",
        linkOpacity: 0.2,
        countBar: "#ff0035"  // Color for the count bars
    },
    zoom: {
        min: 0.1,
        max: 4
    },
    layout: {
        radialRadiusScale: 0.5,     // for radial view
        clusterHeightScale: 1.8,    // for cluster view
        clusterWidthScale: 0.3,     // for cluster view
        nodeRadius: 4,
        labelOffset: 6,
        useSmoothPaths: true,       // for path style (smooth vs straight)
        countBarHeight: 3,          // height of count bars 
        countBarMaxWidth: 50        // maximum width for count bars
    },
    fontSize: {
        parent: 14,  // no px
        leaf: 12     // no px
    }
};

// Store initial config at the top after CONFIG definition
const INITIAL_CONFIG = JSON.parse(JSON.stringify(CONFIG));

function debug(...args) {
    if (debugMode) console.log('[DEBUG]', ...args);
}

function updateValueDisplay(id, value) {
    const valueDisplay = document.getElementById(`${id}_value`);
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
}

function initializeControls() {
    // initial values for ranges
    debug("Initializing controls with colors:", {
        parent: CONFIG.colors.nodeParent,
        leaf: CONFIG.colors.nodeLeaf,
        link: CONFIG.colors.link
    });
    document.getElementById('radialScale').value = CONFIG.layout.radialRadiusScale;
    document.getElementById('clusterHeight').value = CONFIG.layout.clusterHeightScale;
    document.getElementById('clusterWidth').value = CONFIG.layout.clusterWidthScale;
    document.getElementById('nodeRadius').value = CONFIG.layout.nodeRadius;
    document.getElementById('labelOffset').value = CONFIG.layout.labelOffset;
    document.getElementById('nodeParentColor').value = CONFIG.colors.nodeParent;
    document.getElementById('nodeLeafColor').value = CONFIG.colors.nodeLeaf;
    document.getElementById('linkColor').value = CONFIG.colors.link;
    document.getElementById('linkOpacity').value = CONFIG.colors.linkOpacity;
    document.getElementById('fontSizeParent').value = CONFIG.fontSize.parent;
    document.getElementById('fontSizeLeaf').value = CONFIG.fontSize.leaf;

    // values for labels
    Object.entries({
        radialScale: CONFIG.layout.radialRadiusScale,
        clusterHeight: CONFIG.layout.clusterHeightScale,
        clusterWidth: CONFIG.layout.clusterWidthScale,
        nodeRadius: CONFIG.layout.nodeRadius,
        labelOffset: CONFIG.layout.labelOffset,
        nodeParentColor: CONFIG.colors.nodeParent,
        nodeLeafColor: CONFIG.colors.nodeLeaf,
        linkColor: CONFIG.colors.link,
        linkOpacity: CONFIG.colors.linkOpacity,
        fontSizeParent: CONFIG.fontSize.parent,
        fontSizeLeaf: CONFIG.fontSize.leaf
    }).forEach(([id, value]) => updateValueDisplay(id, value));

    // listeners for all controls
    const controls = document.querySelectorAll('#controlPanel input');
    controls.forEach(control => {
        control.addEventListener('input', updateConfig);
    });

    // listeners for clamp values
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(range => {
        const baseId = range.id;
        const minInput = document.getElementById(`${baseId}_min`);
        const maxInput = document.getElementById(`${baseId}_max`);

        minInput.addEventListener('change', () => {
            range.min = minInput.value;
            if (parseFloat(range.value) < parseFloat(minInput.value)) {
                range.value = minInput.value;
                updateConfig({ target: range });
            }
        });

        maxInput.addEventListener('change', () => {
            range.max = maxInput.value;
            if (parseFloat(range.value) > parseFloat(maxInput.value)) {
                range.value = maxInput.value;
                updateConfig({ target: range });
            }
        });
    });


    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            debug(`Color ${e.target.id} changed to:`, e.target.value);
        });
    });
}

function updateConfig(event) {
    const id = event.target.id;
    const value = event.target.type === 'range' ? parseFloat(event.target.value) : event.target.value;

    debug('Config update:', id, value);
    updateValueDisplay(id, value);

    switch (id) {
        case 'radialScale':
            CONFIG.layout.radialRadiusScale = value;
            radius = Math.min(width, height) * value;
            break;
        case 'clusterHeight':
            CONFIG.layout.clusterHeightScale = value;
            break;
        case 'clusterWidth':
            CONFIG.layout.clusterWidthScale = value;
            break;
        case 'nodeRadius':
            CONFIG.layout.nodeRadius = value;
            svg.selectAll("circle").attr("r", value);
            break;
        case 'labelOffset':
            CONFIG.layout.labelOffset = value;
            break;
        case 'nodeParentColor':
            CONFIG.colors.nodeParent = value;
            break;
        case 'nodeLeafColor':
            CONFIG.colors.nodeLeaf = value;
            break;
        case 'linkColor':
            CONFIG.colors.link = value;
            break;
        case 'linkOpacity':
            CONFIG.colors.linkOpacity = value;
            break;
        case 'fontSizeParent':
            CONFIG.fontSize.parent = value;
            svg.selectAll(".inner-label")
                .style("font-size", value + "px");
            break;
        case 'fontSizeLeaf':
            CONFIG.fontSize.leaf = value;
            svg.selectAll(".leaf-label")
                .style("font-size", value + "px");
            break;
    }

    debug('New CONFIG state:', CONFIG);
    updateVisualization();
}

function resetConfig() {
    debug('Resetting configuration to initial state');

    // blink animation
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.classList.add('blinking');
    controlPanel.addEventListener('animationend', () => {
        controlPanel.classList.remove('blinking');
    }, { once: true });

    // reset CONFIG object
    Object.assign(CONFIG, JSON.parse(JSON.stringify(INITIAL_CONFIG)));

    // Reset UI controls
    document.getElementById('radialScale').value = CONFIG.layout.radialRadiusScale;
    document.getElementById('clusterHeight').value = CONFIG.layout.clusterHeightScale;
    document.getElementById('clusterWidth').value = CONFIG.layout.clusterWidthScale;
    document.getElementById('nodeRadius').value = CONFIG.layout.nodeRadius;
    document.getElementById('labelOffset').value = CONFIG.layout.labelOffset;
    document.getElementById('nodeParentColor').value = CONFIG.colors.nodeParent;
    document.getElementById('nodeLeafColor').value = CONFIG.colors.nodeLeaf;
    document.getElementById('linkColor').value = CONFIG.colors.link;
    document.getElementById('linkOpacity').value = CONFIG.colors.linkOpacity;
    document.getElementById('fontSizeParent').value = CONFIG.fontSize.parent;
    document.getElementById('fontSizeLeaf').value = CONFIG.fontSize.leaf;

    // update all value displays on reset
    Object.entries({
        radialScale: CONFIG.layout.radialRadiusScale,
        clusterHeight: CONFIG.layout.clusterHeightScale,
        clusterWidth: CONFIG.layout.clusterWidthScale,
        nodeRadius: CONFIG.layout.nodeRadius,
        labelOffset: CONFIG.layout.labelOffset,
        nodeParentColor: CONFIG.colors.nodeParent,
        nodeLeafColor: CONFIG.colors.nodeLeaf,
        linkColor: CONFIG.colors.link,
        linkOpacity: CONFIG.colors.linkOpacity,
        fontSizeParent: CONFIG.fontSize.parent,
        fontSizeLeaf: CONFIG.fontSize.leaf
    }).forEach(([id, value]) => updateValueDisplay(id, value));

    debug('Configuration reset complete');
    updateVisualization();
}

let isRadialLayout = true;


// update dimensions
const calculateDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    radius: Math.min(window.innerWidth, window.innerHeight) * CONFIG.layout.radialRadiusScale
});

let { width, height, radius } = calculateDimensions();

// init transform state
let transform = d3.zoomIdentity.translate(width / 2, height / 2);

// zoom behavior
const zoom = d3.zoom()
    .scaleExtent([CONFIG.zoom.min, CONFIG.zoom.max])
    .on("zoom", zoomed);

// SVG base
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100vw")
    .attr("height", "100vh")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("cursor", "grab")
    .call(zoom) // Apply zoom behavior
    .append("g")
    .attr("transform", transform.toString());

// initial transform
d3.select("#chart svg").call(zoom.transform, transform);

function zoomed(event) {
    debug('Zoom event:', {
        transform: event.transform,
        sourceEvent: event.sourceEvent?.type
    });

    // Keep scale from previous transform when panning starts
    if (event.sourceEvent && event.sourceEvent.type === "mousemove") {
        event.transform.k = transform.k;
    }
    transform = event.transform;
    svg.attr("transform", transform.toString());
}

// radial tree layout with responsive size
const tree = d3.tree()
    .size([2 * Math.PI, radius]);

// Smooth radial link path
const radialLinkSmooth = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);

// Custom straight radial links
const radialLinkStraight = (d) => {
    const startAngle = d.source.x;
    const startRadius = d.source.y;
    const endAngle = d.target.x;
    const endRadius = d.target.y;
    
    const x1 = startRadius * Math.cos(startAngle - Math.PI/2);
    const y1 = startRadius * Math.sin(startAngle - Math.PI/2);
    const x2 = endRadius * Math.cos(endAngle - Math.PI/2);
    const y2 = endRadius * Math.sin(endAngle - Math.PI/2);
    
    return `M${x1},${y1}L${x2},${y2}`;
};

// Horizontal link generators
const horizontalLinkSmooth = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

const horizontalLinkStraight = (d) => {
    return `M${d.source.y},${d.source.x}L${d.target.y},${d.target.x}`;
};

// resize handler
window.addEventListener('resize', () => {
    debug('Window resized:', {
        width: window.innerWidth,
        height: window.innerHeight
    });

    const dims = calculateDimensions();
    width = dims.width;
    height = dims.height;
    radius = dims.radius;

    // Update transform center position
    transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(transform.k);

    svg.attr("transform", transform.toString());

    if (isRadialLayout) {
        tree.size([2 * Math.PI, radius]);
    } else {
        tree.size([height * CONFIG.layout.clusterHeightScale,
        width * CONFIG.layout.clusterWidthScale]);
    }

    // if data is loaded recompute
    if (svg.selectAll("path.link").size() > 0) {
        updateVisualization();
    }
});


function updateVisualization() {
    const root = d3.select("#chart").datum();
    if (!root) {
        debug('No data to visualize');
        return;
    }

    debug('Updating visualization', {
        layout: isRadialLayout ? 'radial' : 'horizontal',
        pathStyle: CONFIG.layout.useSmoothPaths ? 'smooth' : 'straight',
        dimensions: { width, height, radius },
        transform: transform.toString()
    });

    // Set tree size without modifying transform
    if (isRadialLayout) {
        tree.size([2 * Math.PI, radius]);
    } else {
        tree.size([height * CONFIG.layout.clusterHeightScale,
        width * CONFIG.layout.clusterWidthScale]);
    }

    tree(root);

    // links - use the appropriate link generator based on layout and path style
    svg.selectAll("path.link")
        .attr("d", d => {
            if (isRadialLayout) {
                return CONFIG.layout.useSmoothPaths ? radialLinkSmooth(d) : radialLinkStraight(d);
            } else {
                return CONFIG.layout.useSmoothPaths ? horizontalLinkSmooth(d) : horizontalLinkStraight(d);
            }
        });

    // nodes position
    svg.selectAll("g.node")
        .attr("transform", d => isRadialLayout ?
            `rotate(${(d.x * 180 / Math.PI - 90)})translate(${d.y},0)` :
            `translate(${d.y},${d.x})`);

    // Update count bars
    svg.selectAll("rect.count-bar")
        .attr("transform", d => {
            if (isRadialLayout && d.x >= Math.PI) {
                // Flip bars on the left side of radial layout
                return "rotate(180)";
            }
            return "";
        })
        .attr("x", d => {
            if (isRadialLayout && d.x >= Math.PI) {
                // Left side of radial layout (flipped)
                return -CONFIG.layout.nodeRadius;
            } else {
                // Right side of radial or horizontal layout
                return CONFIG.layout.nodeRadius;
            }
        });

    // Update text rotation and position
    svg.selectAll("text")
        .attr("transform", d => {
            if (isRadialLayout) {
                return d.x >= Math.PI ? "rotate(180)" : null;
            }
            return "rotate(0)";
        })
        .attr("text-anchor", d => {
            if (isRadialLayout) {
                return d.x < Math.PI === !d.children ? "start" : "end";
            }
            return d.children ? "end" : "start";
        })
        .attr("x", d => {
            if (isRadialLayout) {
                return d.x < Math.PI === !d.children ? CONFIG.layout.labelOffset : -CONFIG.layout.labelOffset;
            }
            return d.children ? -CONFIG.layout.labelOffset : CONFIG.layout.labelOffset;
        });
}

// load CSV and process it
d3.csv(pathToCSV).then(data => {
    debug('CSV loaded, rows:', data.length);

    // Update CSV filename in marquee
    document.getElementById('csvFileName').textContent = pathToCSV;

    // hierarchy: root (dummy name) > category > composition > artist
    const rootData = { name: "rewire content", children: [] };
    const categoryMap = new Map();

    data.forEach(d => {
        const category = d.Category;
        const composition = d.Composition;
        const artist = d.Artist;
        const count = +d.Count; // convert count to a number

        // retrieve the category node or create it if it doesn't exist
        if (!categoryMap.has(category)) {
            const categoryNode = { name: category, children: [] };
            categoryMap.set(category, categoryNode);
            rootData.children.push(categoryNode);
        }
        const categoryNode = categoryMap.get(category);

        // retrieve the composition node within the category or create it if it doesn't exist
        let compositionNode = categoryNode.children.find(c => c.name === composition);
        if (!compositionNode) {
            compositionNode = { name: composition, children: [] };
            categoryNode.children.push(compositionNode);
        }

        // leafs
        compositionNode.children.push({ name: artist, value: count });
    });

    // prepare generated tree
    const root = d3.hierarchy(rootData, d => d.children);

    // to represent population by thickness
    root.sum(d => d.value || 0);

    debug('Hierarchy created:', {
        nodes: root.descendants().length,
        depth: root.height,
        totalValue: root.value
    });

    // link scale
    // TODO: population size must be visualized 
    const linkScale = d3.scaleLinear()
        .domain([0, root.value])
        .range([1, 80]); // min and max thickness of path links per layer

    tree(root);

    // for resize updates
    d3.select("#chart").datum(root);

    //////////////////////
    //      DRAW
    //////////////////////
    svg.selectAll("path.link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", radialLinkSmooth)
        .attr("fill", "none")
        .attr("stroke", CONFIG.colors.link)
        .attr("stroke-opacity", CONFIG.colors.linkOpacity)
        .attr("stroke-width", d => linkScale(d.target.value));

    // nodes
    const node = svg.selectAll("g.node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `
            rotate(${(d.x * 180 / Math.PI - 90)})
            translate(${d.y},0)
        `);

    node.append("circle")
        .attr("r", CONFIG.layout.nodeRadius)
        .attr("fill", d => d.children ? CONFIG.colors.nodeParent : CONFIG.colors.nodeLeaf);

    node.append("text")
        .text(d => d.data.name)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("x", d => d.x < Math.PI === !d.children ? CONFIG.layout.labelOffset : -CONFIG.layout.labelOffset) // how far away from the node
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null) // after half a circle do a flip
        .style("font-size", d => d.children ?
            CONFIG.fontSize.parent + "px" :
            CONFIG.fontSize.leaf + "px");      // styling

    // Add count bars for leaf nodes (artists)
    const maxValue = d3.max(root.leaves(), leaf => leaf.value || 0);

    node.filter(d => !d.children) // Only for leaf nodes
        .append("rect")
        .attr("class", "count-bar")
        .attr("x", d => CONFIG.layout.nodeRadius)
        .attr("y", -CONFIG.layout.countBarHeight / 2)
        .attr("height", CONFIG.layout.countBarHeight)
        .attr("width", d => (d.value / maxValue) * CONFIG.layout.countBarMaxWidth)
        .attr("fill", CONFIG.colors.countBar)
        .attr("transform", d => {
            if (isRadialLayout && d.x >= Math.PI) {
                return "rotate(180)";
            }
            return "";
        });

}).catch(error => {
    debug('Error loading CSV:', error);
});

function exportSVG() {
    debug('Starting SVG export');
    const svgNode = document.querySelector("#chart svg");
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgNode);

    // add namespaces if missing
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // XML declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    // convert to URI
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    // export SVG button
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${pathToCSV.slice(0, -4)}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    debug('SVG exported:', downloadLink.download);
}

// export and layout buttons
document.getElementById("exportBtn").addEventListener("click", exportSVG);
document.getElementById("toggleBtn").addEventListener("click", toggleLayout);
document.getElementById('resetBtn').addEventListener('click', resetConfig);
document.getElementById("pathStyleBtn").addEventListener("click", togglePathStyle);

function toggleLayout() {
    isRadialLayout = !isRadialLayout;
    debug('Layout toggled:', isRadialLayout ? 'radial' : 'horizontal');

    // Keep current scale when toggling
    const currentScale = transform.k;
    transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(currentScale);

    // Apply smooth transition
    d3.select("#chart svg")
        .transition()
        .duration(300)
        .call(zoom.transform, transform);

    updateVisualization();
}

function togglePathStyle() {
    CONFIG.layout.useSmoothPaths = !CONFIG.layout.useSmoothPaths;
    document.getElementById('pathStyleBtn').textContent = 
        CONFIG.layout.useSmoothPaths ? 'SMOOTH PATHS' : 'STRAIGHT PATHS';
    updateVisualization();
}

window.addEventListener('load', initializeControls);
