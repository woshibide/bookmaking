const pathToCSV = "for_Rewire_design_team-data_set.csv"


const COLORS = {
    nodeParent: "#555",
    nodeLeaf: "#999",
    link: "#555",
    linkOpacity: 0.2
};


const calculateDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    radius: Math.min(window.innerWidth, window.innerHeight) * 0.35
});

let { width, height, radius } = calculateDimensions();



// SVG base
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100vw")
    .attr("height", "100vh")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);


// radial tree layout with responsive size
const tree = d3.tree()
    .size([2 * Math.PI, radius]);
// radial link path
const radialLink = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);


// resize handler
window.addEventListener('resize', () => {
    const dims = calculateDimensions();
    width = dims.width;
    height = dims.height;
    radius = dims.radius;

    svg.attr("transform", `translate(${width / 2},${height / 2})`);
    tree.size([2 * Math.PI, radius]);

    // if data is loaded recompute
    if (svg.selectAll("path.link").size() > 0) {
        updateVisualization();
    }
});


function updateVisualization() {
    const root = d3.select("#chart").datum();
    if (!root) return;

    tree(root);

    // links
    svg.selectAll("path.link")
        .attr("d", radialLink);

    // nodes
    svg.selectAll("g.node")
        .attr("transform", d => `
            rotate(${(d.x * 180 / Math.PI - 90)})
            translate(${d.y},0)
        `);
}

// load CSV and convert it
d3.csv(pathToCSV).then(data => {

    // hierarchy: root (dummy name) > category > composition > artist
    const rootData = { name: "root", children: [] };
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

        // add the artist as a leaf node
        compositionNode.children.push({ name: artist, value: count });
    });

    // prepare generated tree
    const root = d3.hierarchy(rootData, d => d.children);

    // to represent population by thickness
    root.sum(d => d.value || 0);

    // link scale
    const linkScale = d3.scaleLinear()
        .domain([0, root.value])
        .range([1, 1]); // min and max thickness of path links

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
        .attr("d", radialLink)
        .attr("fill", "none")
        .attr("stroke", COLORS.link)
        .attr("stroke-opacity", COLORS.linkOpacity)
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
        .attr("r", 4)
        .attr("fill", d => d.children ? COLORS.nodeParent : COLORS.nodeLeaf);

    // labels for nodes
    node.append("text")
        .attr("dy", "0.50em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6) // how far away from the node
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end") 
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null) // after half a circle do a flip
        .attr("class", d => d.children ? "inner-label" : "leaf-label")
        .style("font-weight", d => d.children ? "bold" : "normal")  // text
        .style("font-size", d => d.children ? "14px" : "12px")      // styling
        .text(d => d.data.name === "Root" ? "" : d.data.name);

});

//////////////////////
//       SVG
//////////////////////
function exportSVG() {
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
}

// Bind export button.
document.getElementById("exportBtn").addEventListener("click", exportSVG);
