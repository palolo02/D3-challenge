


//ssetTimeout(function(){ console.log('Loading page') }, 1000);

// Deifne SVG area size
var svgWidth = 1000;
var svgHeight = 650;

// Define margin area for plot and axis labels
var margin = {
  top: 60,
  right: 60,
  bottom: 80,
  left: 90,
  axisLabel : 20 // Space for labels
};

// Chart area real size
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;
// Debugg
console.log(chartWidth)
console.log(chartHeight)

// Scatter reference with proper dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define default configuration for axis labels
var chartData = null; 
var currentXValue = "poverty";  
var currentYValue = "healthcare";

var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
                    "age": "Age (Median)", 
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)", 
                    "smokes": "Smokes (%)", 
                    "healthcare": "Lacks Healthcare (%)" };




// Retrieve and load data from csv file
d3.csv("assets/data/data.csv").then((data, error) => {
    // Raise an exception in case of error
    if (error) 
        throw error;
  
    // Get proper int data types
    data.forEach(d => {
      d.poverty = parseInt(d.poverty);
      d.age = parseInt(d.age);
      d.income = parseInt(d.income);
      d.obesity = parseInt(d.obesity);
      d.healthcare = parseInt(d.healthcare);
      d.smokes = parseInt(d.smokes);
    });

    // Save data for plotting
    chartData = data;

    // Initialize scatter chart
    loadGraph();
});


// function initialize the chart elements
function loadGraph() {
    // Create initial xLinearScale, yLinearScale
    var xLinearScale = setScale(chartData, currentXValue, "x");
    var yLinearScale = setScale(chartData, currentYValue, "y");

    // Create initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // show x axis
    chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // show y axis
    chartGroup.append("g")
        .classed("axis", true)
        .call(leftAxis);
        
    // Create circles with text
    var container = chartGroup.selectAll("g circle")
        .data(chartData);
 
    // Add group for text inside circle  
    var circle = container.enter()
        .append("g")
        //.attr("id", "container");
        .classed("container", true);
    
    var radius = 12;
    // Add circles
    circle.append("circle")
        .classed("stateCircle", true)
        .attr('cx', d => xLinearScale(d[currentXValue]))
        .attr('cy', d => yLinearScale(d[currentYValue]))
        .attr('r', radius);        
    
    // Add abbreviated text for circles
    var fontSize = 10
    circle.append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[currentXValue]))
        .attr("dy", d => yLinearScale(d[currentYValue]))
        .attr("font-size", fontSize);        
  
    // Create group for xTitles: x-axis label
    var xTitles = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight+20})`)
        .classed("atext", true)
        .attr("id", "xTitles");

    // Create text of the x-axis label
    xTitles.selectAll("text")
        .data(xAxisLabels)
        .enter()
        .append("text")
        //.attr("x", 0)
        .attr("y", (d,i) => (i+1)*margin.axisLabel)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d == currentXValue) ? true:false)
        .classed("inactive", d => (d == currentXValue) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // Create group for yLabels: y-axis labels
    var yLabels = chartGroup.append("g")
        //.attr("transform", `rotate(-90 ${(margin.left/2)} ${(chartHeight/2)+60})`)
        .attr("transform", `rotate(-90 ${(margin.left)} 185)`)
        .classed("atext", true)
        .attr("id", "yLabels");
    
    yLabels.selectAll("text")
        .data(yAxisLabels)
        .enter()
        .append("text")
        .attr("x", margin.top)
        .attr("y", (d,i) => (i+1)*margin.axisLabel)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === currentYValue) ? true:false)
        .classed("inactive", d => (d === currentYValue) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // updateToolTip function
    console.log("Init")
    console.log(currentXValue)
    console.log(currentYValue)
    console.log(circle)
    var circle = updateToolTip(currentXValue, currentYValue, circle);
};



// Overwrite scale function
function setScale(chartData, chosenAxis, choice) {
    // Determine the range based on the selection of the axis
    var axisRange = [];
    // x axis selection
    console.log(choice)
    console.log(chosenAxis)
    if(choice === "x")
        axisRange = [0, chartWidth];
    else // y axis selection
        axisRange = [chartHeight, 0];
    
    // create scales for chosen axis according to the variables selected
    var linearScale = d3.scaleLinear()
        .domain([d3.min(chartData, d => d[chosenAxis]) * 0.7,
                 d3.max(chartData, d => d[chosenAxis]) * 1.2])
        .range(axisRange);
    console.log(axisRange)
    return linearScale;
}

// function used for updating xyAxis var upon click on axis label text
function renderAxis(newScale, Axis, choice) {
    var posAxis = (choice === "x") ? d3.axisBottom(newScale):d3.axisLeft(newScale)
  
    // Redner transition between xy-axis change
    Axis.transition()
      .duration(1000)
      .call(posAxis);
  
    return Axis;
}

// function used for updating circles group with a transition to
function renderCircles(elemEnter, newScale, chosenAxis, xy) {

    // Render transition of circles
    elemEnter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr(`c${xy}`, d => newScale(d[chosenAxis]));
    console.log(elemEnter)
    // Render transition of text
    elemEnter.selectAll("text")
        .transition()
        .duration(1000)
        .attr(`d${xy}`, d => newScale(d[chosenAxis]));
  
    return elemEnter;
}

// function used for updating circles group with new tooltip
function updateToolTip(currentXValue, currentYValue, container) {
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => {
                    console.log(d)
                    return `<div><strong>${d.state}</strong>
                    <br>${currentXValue}: ${d[currentXValue]} 
                    <br>${currentYValue}: ${d[currentYValue]} %</div>`});    
    svg.call(toolTip);

    // Assign hover events
    container.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);
   
    return container;
}

// update values in graph after clicking axis labels
function updateChart() {
    // get selected value from axis
    var value = d3.select(this).attr("value");
    
    // get the x or y axis the value belongs to
    var choice = xAxisLabels.includes(value) ? "x":"y";

    // get the element enter
    var container = d3.selectAll(".container");

    // get the xAxis or yAxis tag object
    var axis = (choice==="x") ? d3.select("#xAxis"):d3.select("#yAxis");
    //  select the chosenAxis
    var chosenAxis = (choice === "x") ? currentXValue:currentYValue;

    if (value != chosenAxis) {
        // replaces chosenAxis with selected value
        if(choice == "x") {
            currentXValue = value;
        }
        else {
            currentYValue = value;
        };

        // update new chosenAxis
        if (choice === "x")
            chosenAxis = currentXValue;
        else
            chosenAxis = currentYValue;
        
        // updates choice scale for new data
        linearScale = setScale(chartData, chosenAxis, choice);
        // updates chosen axis with transition
        axis = renderAxis(linearScale, axis, choice);
        // updates circles with new chosen axis values
        container = renderCircles(container, linearScale, chosenAxis, choice);
        console.log(container)
        console.log("currentXValue: " + currentXValue)
        console.log("currentYValue: " + currentYValue)
        // updates tooltips with new info
        container = updateToolTip(currentXValue, currentYValue, container);
        
        // Parse through the chosen Axis Labels and reset the active/inactive + visibility
        axisLabels = (choice === "x") ? xAxisLabels:yAxisLabels
        axisLabels.forEach(label => {
            if(label === value) {
                // Text Label
                d3.select(`[value=${label}]`).classed("active", true);
                d3.select(`[value=${label}]`).classed("inactive", false);
                // Rect switch axis
                d3.select(`[value=${choice+label}]`).classed("invisible", true);
            }
            else { // not selected
                // Text Label
                d3.select(`[value=${label}]`).classed("active", false);
                d3.select(`[value=${label}]`).classed("inactive", true);
                // Rect switch axis
                d3.select(`[value=${choice+label}]`).classed("invisible", false);
            }
        });
    };
}

// function updates the axis labels tooptip on the rect tag
function updateLabelsTooltip(xy, labelEnter) {
    console.log('updateLabelsTooltip')
    // reverse xy for move to opposite axis
    xy = (xy === "x") ? "y":"x";
    // add tooltip to the rect tag
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => `Move ${d} to ${xy}-axis`);
    
    svg.call(toolTip);
    // add the event handlers
    labelEnter.classed("active inactive", true)
    .on('mouseenter', toolTip.show)
    .on('mouseleave', toolTip.hide)
    .on('mousedown', toolTip.hide);

    return labelEnter;
}


// function updates the text tag into axis label group
function updateLabelsText(xy, xPos, labelsText) {
    // Define chosenAxis by xy
    var chosenAxis = (xy === "x") ? currentXValue : currentYValue;
    // Add text tag
    var enterlabelsText = null; labelsText.enter()
                                    .append("text");
    // Append text tag
    enterlabelsText = labelsText.enter()
        .append("text")
        .merge(labelsText)
        .attr("x", xPos)
        .attr("y", (d,i) => (i+1)*margin.axisLabel)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chosenAxis) ? true:false)
        .classed("inactive", d => (d === chosenAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);
}

// function updates the axis labels after moving one of the axes
function updateLabel() {
    console.log('updateLabel')
    // get move value of selection and slice it for the xy axis and axis label value
    var moveLabel = d3.select(this).attr("value");
    var oldAxis = moveLabel.slice(0,1);
    var selectedLabel = moveLabel.slice(1);

    // Move axis label to the other axis
    if (oldAxis === "x") {
        // Remove label from x-axis labels
        xAxisLabels = xAxisLabels.filter(e => e !== selectedLabel);
        // Add label to yLabels labels
        yAxisLabels.push(selectedLabel);
    } 
    else {
        // Remove label from y-axis labels
        yAxisLabels = yAxisLabels.filter(e => e !== selectedLabel);
        // Add label to xTitles labels
        xAxisLabels.push(selectedLabel);
    }

    // Update group for x axis labels group of rect + text
    var xTitles = d3.select("#xTitles");
    
    // append the text for the x-axis labels
    var xTitlesText = xTitles.selectAll("text")
        .data(xAxisLabels);
    // update labels text
    updateLabelsText("x", 0, xTitlesText);
    // Remove any excess old data
    xTitlesText.exit().remove();

    // Update group for y axis labels group of rect + text
    var yLabels = d3.select("#yLabels");
    
    updateLabelsTooltip("y", yEnterLabelsRect);

    // append the text for the x-axis labels
    var yLabelsText = yLabels.selectAll("text")
        .data(yAxisLabels);
    // update labels text tag
    updateLabelsText("y", margin.top, yLabelsText);
    // Remove any excess old data
    yLabelsText.exit().remove();
}

