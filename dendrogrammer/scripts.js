let debugMode = true;

const pathToCSV = "for_Rewire_design_team-data_set.csv";

const CONFIG = {
    colors: {
        nodeParent: "#ff0035",
        nodeLeaf: "#ff0035",
        link: "#ff0035",
        linkOpacity: 0.2,
        countBar: "#ff0035",
        fontColor: "#ff0035",
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
        pathStyle: "elbow",        // smooth / elbow / straight
        
        countBarHeight: 3,         // height of count bars 
        countBarMaxWidth: 50,      // maximum width for count bars
        countBarScale: 1,          // scaling factor for count bars
        countBarExponent: 1        // exponent for non-linear mapping (1 = linear)
    },
    fontSize: {
        parent: 14,  // px are added after
        leaf: 12     // px are added after
    },
    links: {
        minWidth: 1,
        maxWidth: 40
    }
};

// used for resetting values
const INITIAL_CONFIG = JSON.parse(JSON.stringify(CONFIG));

// Define linkScale globally with default values
let linkScale = d3.scaleLinear()
    .domain([1, 100])
    .range([CONFIG.links.minWidth, CONFIG.links.maxWidth]);

// Define getLinkWidth as a global function
const getLinkWidth = d => linkScale(d.target.value);

/**
 * global debug logging function - only outputs when debug mode is enabled
 * @param {...any} args - arguments to log to console
 */
function debug(...args) {
    if (debugMode) console.log('>>>', ...args);
}

/**
 * updates the displayed value for a control in the ui
 * @param {string} id - id of the control element
 * @param {any} value - value to display
 */
function updateValueDisplay(id, value) {
    const valueDisplay = document.getElementById(`${id}_value`);
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
}

/**
 * sets up all ui controls with initial values and event listeners
 */
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
    document.getElementById('linkMinWidth').value = CONFIG.links.minWidth;
    document.getElementById('linkMaxWidth').value = CONFIG.links.maxWidth;
    document.getElementById('countBarHeight').value = CONFIG.layout.countBarHeight;
    document.getElementById('countBarScale').value = CONFIG.layout.countBarScale;
    document.getElementById('countBarExponent').value = CONFIG.layout.countBarExponent;


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
        fontSizeLeaf: CONFIG.fontSize.leaf,
        linkMinWidth: CONFIG.links.minWidth,
        linkMaxWidth: CONFIG.links.maxWidth,
        countBarHeight: CONFIG.layout.countBarHeight,
        countBarScale: CONFIG.layout.countBarScale,
        countBarExponent: CONFIG.layout.countBarExponent
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

/**
 * event handler that updates configuration when controls change
 * @param {Event} event - the dom event from the control
 */
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
        case 'linkMinWidth':
            CONFIG.links.minWidth = value;
            // update the scale range
            linkScale.range([value, CONFIG.links.maxWidth]);
            break;
        case 'linkMaxWidth':
            CONFIG.links.maxWidth = value;
            // update the scale range
            linkScale.range([CONFIG.links.minWidth, value]);
            break;
        case 'fontSizeParent':
            CONFIG.fontSize.parent = value;
            debug("Updating parent font size", value);
            break;
        case 'fontSizeLeaf':
            CONFIG.fontSize.leaf = value;
            debug("Updating leaf font size", value);
            break;
        case 'countBarHeight':
            CONFIG.layout.countBarHeight = value;
            // update height of bars
            svg.selectAll("rect.count-bar")
               .attr("height", value)
               .attr("y", -value / 2);
            break;
        case 'countBarScale':
            CONFIG.layout.countBarScale = value;
            updateCountBars();
            break;
        case 'countBarExponent':
            CONFIG.layout.countBarExponent = value;
            updateCountBars();
            break;
    }

    debug('New CONFIG state:', CONFIG);
    updateVisualization();
}


/**
 * calculates the appropriate width for count bars based on data value
 * @param {number} value - the data value to represent
 * @param {number} maxValue - the maximum value in the dataset
 * @returns {number} - calculated bar width
 */
function calculateBarWidth(value, maxValue) {
    // apply non-linear mapping with exponent
    const normalizedValue = Math.pow(value / maxValue, CONFIG.layout.countBarExponent);
    // apply scaling factor
    return normalizedValue * CONFIG.layout.countBarMaxWidth * CONFIG.layout.countBarScale;
}

/**
 * updates all count bars when scale or exponent changes
 */
function updateCountBars() {
    // get the current maximum value from data
    const chart = d3.select("#chart");
    const root = chart.datum();
    if (!root) return;
    
    const maxValue = d3.max(root.leaves(), leaf => leaf.value || 0);
    
    // update all count bars
    svg.selectAll("rect.count-bar")
       .attr("width", d => calculateBarWidth(d.value, maxValue));
}

/**
 * toggles between radial and horizontal layout modes
 */
function toggleLayout() {
    // toggle between radial and horizontal layouts
    isRadialLayout = !isRadialLayout;
    
    // update button text to reflect current layout
    document.getElementById('toggleBtn').textContent = 
        isRadialLayout ? 'RADIAL' : 'HORIZONTAL';
    
    debug('Layout changed to:', isRadialLayout ? 'radial' : 'horizontal');
    
    // reset the view to center
    transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(transform.k);
    d3.select("#chart svg").call(zoom.transform, transform);
    
    updateVisualization();
}

/**
 * resets all configuration values to initial state
 */
function resetConfig() {
    debug('Resetting configuration to initial state');

    // blink animation
    const controlPanel = document.getElementById('controlPanel');
    const children = controlPanel.querySelectorAll('*');
    controlPanel.classList.add('blinking');
    children.forEach(child => child.classList.add('blinking'));

    controlPanel.addEventListener('animationend', () => {
        controlPanel.classList.remove('blinking');
        children.forEach(child => child.classList.remove('blinking'));
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
    document.getElementById('linkMinWidth').value = CONFIG.links.minWidth;
    document.getElementById('linkMaxWidth').value = CONFIG.links.maxWidth;
    document.getElementById('countBarHeight').value = CONFIG.layout.countBarHeight;
    document.getElementById('countBarScale').value = CONFIG.layout.countBarScale;
    document.getElementById('countBarExponent').value = CONFIG.layout.countBarExponent;


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
        fontSizeLeaf: CONFIG.fontSize.leaf,
        linkMinWidth: CONFIG.links.minWidth,
        linkMaxWidth: CONFIG.links.maxWidth,
        countBarHeight: CONFIG.layout.countBarHeight,
        countBarScale: CONFIG.layout.countBarScale,
        countBarExponent: CONFIG.layout.countBarExponent
    }).forEach(([id, value]) => updateValueDisplay(id, value));

    debug('Configuration reset complete');
    updateVisualization();
}

/**
 * calculates dimensions based on window size and configuration
 * @returns {Object} object containing width, height and radius values
 */
const calculateDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    radius: Math.min(window.innerWidth, window.innerHeight) * CONFIG.layout.radialRadiusScale
});

let isRadialLayout = true;

// update dimensions
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

/**
 * zoom event handler for svg pan and zoom
 * @param {d3.ZoomEvent} event - the zoom event from d3
 */
function zoomed(event) {
    // debug('Zoom event:', {
    //     transform: event.transform,
    //     sourceEvent: event.sourceEvent?.type
    // });

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

// smooth radial link path
const radialLinkSmooth = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);

/**
 * generates a straight line path between two radial points
 * @param {Object} d - the link data object containing source and target
 * @returns {string} - svg path data string
 */
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

/**
 * generates an elbow path between two radial points
 * @param {Object} d - the link data object containing source and target
 * @returns {string} - svg path data string
 */
const radialLinkElbow = (d) => {
    const startAngle = d.source.x;
    const startRadius = d.source.y;
    const endAngle = d.target.x;
    const endRadius = d.target.y;
    
    // calculate midpoint for the elbow
    const midRadius = (startRadius + endRadius) / 2;
    
    // convert to cartesian coordinates
    const x1 = startRadius * Math.cos(startAngle - Math.PI/2);
    const y1 = startRadius * Math.sin(startAngle - Math.PI/2);
    
    // mid point (same angle as start, but at mid radius)
    const xMid = midRadius * Math.cos(startAngle - Math.PI/2);
    const yMid = midRadius * Math.sin(startAngle - Math.PI/2);
    
    // mid point (same angle as end, but at mid radius)
    const xMid2 = midRadius * Math.cos(endAngle - Math.PI/2);
    const yMid2 = midRadius * Math.sin(endAngle - Math.PI/2);
    
    // end point
    const x2 = endRadius * Math.cos(endAngle - Math.PI/2);
    const y2 = endRadius * Math.sin(endAngle - Math.PI/2);
    
    // create path with elbow points
    return `M${x1},${y1}L${xMid},
            ${yMid}A${midRadius},
            ${midRadius} 0 0,
            ${startAngle < endAngle ? 1 : 0} ${xMid2},
            ${yMid2}L${x2},${y2}`;
};

// Horizontal link generators
const horizontalLinkSmooth = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

/**
 * generates a straight line path between two horizontal points
 * @param {Object} d - the link data object containing source and target
 * @returns {string} - svg path data string
 */
const horizontalLinkStraight = (d) => {
    return `M${d.source.y},${d.source.x}L${d.target.y},${d.target.x}`;
};

/**
 * generates an elbow path between two horizontal points
 * @param {Object} d - the link data object containing source and target
 * @returns {string} - svg path data string
 */
const horizontalLinkElbow = (d) => {
    // the elbow is created by drawing a path with an intermediate point
    return `M${d.source.y},${d.source.x}
            H${(d.source.y + d.target.y) / 2}
            V${d.target.x}
            H${d.target.y}`;
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

/**
 * updates the visualization based on current config and layout mode
 */
function updateVisualization() {
    const root = d3.select("#chart").datum();
    if (!root) {
        debug('No data to visualize');
        return;
    }

    debug('Updating visualization', {
        layout: isRadialLayout ? 'radial' : 'horizontal',
        pathStyle: CONFIG.layout.pathStyle,
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
                if (CONFIG.layout.pathStyle === "smooth") return radialLinkSmooth(d);
                if (CONFIG.layout.pathStyle === "elbow") return radialLinkElbow(d);
                return radialLinkStraight(d);
            } else {
                if (CONFIG.layout.pathStyle === "smooth") return horizontalLinkSmooth(d);
                if (CONFIG.layout.pathStyle === "elbow") return horizontalLinkElbow(d);
                return horizontalLinkStraight(d);
            }
        })
        .attr("stroke-width", getLinkWidth); // update stroke

    // nodes position
    svg.selectAll("g.node")
        .attr("transform", d => isRadialLayout ?
            `rotate(${(d.x * 180 / Math.PI - 90)})translate(${d.y},0)` :
            `translate(${d.y},${d.x})`);

    // count bars
    svg.selectAll("rect.count-bar")
        .attr("x", d => {
            if (isRadialLayout && d.x >= Math.PI) {
                // radial
                return -CONFIG.layout.nodeRadius;
            } else {
                // horizontal layout
                return CONFIG.layout.nodeRadius;
            }
        });

    // update text rotation and position
    debug("Applying font sizes:", CONFIG.fontSize);
    svg.selectAll("text")
        .style("font-size", d => {
            const size = d.children ? 
                CONFIG.fontSize.parent + "px" : 
                CONFIG.fontSize.leaf + "px";
            return size;
        })
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

    // Update the global linkScale with actual data values
    const minLinkValue = d3.min(root.descendants().filter(d => d.value > 0), d => d.value);
    const maxLinkValue = d3.max(root.descendants(), d => d.value);
    
    // Update the existing linkScale instead of creating a new one
    linkScale.domain([minLinkValue || 1, maxLinkValue])
             .range([CONFIG.links.minWidth, CONFIG.links.maxWidth]);

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
        .attr("stroke-width", getLinkWidth);

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
        .attr("class", d => d.children ? "inner-label" : "leaf-label") // Keep these classes
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("x", d => d.x < Math.PI === !d.children ? CONFIG.layout.labelOffset : -CONFIG.layout.labelOffset)
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .style("fill", CONFIG.colors.fontColor)
        .style("font-size", d => {
            const size = d.children ?
                CONFIG.fontSize.parent + "px" :
                CONFIG.fontSize.leaf + "px";
            return size;
        });

    // count bars for leaf nodes
    const maxValue = d3.max(root.leaves(), leaf => leaf.value || 0);

    node.filter(d => !d.children) // only for leaf nodes
        .append("rect")
        .attr("class", "count-bar")
        .attr("x", d => CONFIG.layout.nodeRadius)
        .attr("y", -CONFIG.layout.countBarHeight / 2)
        .attr("height", CONFIG.layout.countBarHeight)
        .attr("width", d => calculateBarWidth(d.value, maxValue)) 
        .attr("fill", CONFIG.colors.countBar)
        .attr("opacity", 0.5); // TODO: DONT HARDCODE
}).catch(error => {
    debug('Error loading CSV:', error);
});

/**
 * exports the current visualization as an svg file
 */
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

// add path style state
const pathStyles = ["smooth", "elbow", "straight"];
let currentPathStyleIndex = pathStyles.indexOf(CONFIG.layout.pathStyle); // as in the initialization

/**
 * cycles through available path styles (smooth, elbow, straight)
 */
function togglePathStyle() {
    // cycle through path styles
    currentPathStyleIndex = (currentPathStyleIndex + 1) % pathStyles.length;
    const style = pathStyles[currentPathStyleIndex];
    
    // update config
    CONFIG.layout.pathStyle = style;
    
    // update button text
    document.getElementById('pathStyleBtn').textContent = 
        style === "smooth" ? 'SMOOTH PATHS' : 
        style === "elbow" ? 'ELBOW PATHS' : 'STRAIGHT PATHS';
    
    updateVisualization();
}

window.addEventListener('load', initializeControls);

