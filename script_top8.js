// Load the data
d3.csv("Bicycle_Thefts_Open_Data.csv").then(data => {

    // Aggregation function to get top 8 values for a specified category
    function getTop8(data, category) {
        const counts = d3.rollup(data, v => v.length, d => d[category]);
        return Array.from(counts, ([key, value]) => ({ category: key, count: value }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7);
    }

    // Aggregate data for each selected category
    const divisionData = getTop8(data, "DIVISION");
    const locationTypeData = getTop8(data, "LOCATION_TYPE");
    const premisesTypeData = getTop8(data, "PREMISES_TYPE");

    // Define chart dimensions
    const width = 500, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 50 };

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Helper function to create bar charts in the specified selector
    function createBarChart(data, xLabel, selector) {
        // Clear any existing content within the chart div to prevent overlap
        d3.select(selector).selectAll("*").remove();
        
        // Append the SVG element to the specified selector
        const svg = d3.select(selector)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
        // Define the X and Y scales
        const x = d3.scaleBand()
            .domain(data.map(d => d.category)) // Use the category field for labels
            .range([margin.left, width - margin.right])
            .padding(0.1);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)]) // Use the count field for values
            .nice()
            .range([height - margin.bottom, margin.top]);
        
        // Append bars to the SVG
        svg.append("g")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.category))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => y(0) - y(d.count))
            .attr("fill", "steelblue")
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Count: ${d.count}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });
        
        // Add the X axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        
        // Add the Y axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
        
        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(xLabel);
    }
    
    createBarChart(divisionData, "division", "#division-chart");
    createBarChart(locationTypeData, "location", "#location-chart");
    createBarChart(premisesTypeData, "premises", "#premises-chart");

    // Function to update the displayed chart based on dropdown selection
    function updateTop8Chart() {
        const selectedCategory = document.getElementById("location-selector").value;
        document.querySelectorAll(".locationchart").forEach(chart => {
            chart.style.display = "none";
          });
        document.getElementById(`${selectedCategory}-chart`).style.display = "block";
    }

    // Initial render and event listener for dropdown changes
    updateTop8Chart();
    document.getElementById("location-selector").addEventListener("change", updateTop8Chart);
});

