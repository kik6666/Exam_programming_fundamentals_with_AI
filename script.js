document.addEventListener("DOMContentLoaded", () => {
    // Inputs
    const totalRevenueInput = document.getElementById("totalRevenue");
    const avgOrderValueInput = document.getElementById("avgOrderValue");
    const leadRateInput = document.getElementById("leadRate");
    const prospectRateInput = document.getElementById("prospectRate");

    // Outputs
    const prospectsValue = document.getElementById("prospectsValue");
    const leadsValue = document.getElementById("leadsValue");
    const customersValue = document.getElementById("customersValue");

    const leadsPercent = document.getElementById("leadsPercent");
    const customersPercent = document.getElementById("customersPercent");

    const leadsBar = document.getElementById("leadsBar");
    const customersBar = document.getElementById("customersBar");

    const leadRateLabel = document.getElementById("leadRateLabel");
    const prospectRateLabel = document.getElementById("prospectRateLabel");

    const chartContainer = document.getElementById("chartContainer");
    
    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    document.body.appendChild(tooltip);

    // Custom Language Dropdown logic
    const langTrigger = document.getElementById("languageTrigger");
    const langOptions = document.getElementById("languageOptions");
    const langOptionsList = langOptions ? langOptions.querySelectorAll(".custom-option") : [];

    if (langTrigger && langOptions) {
        langTrigger.addEventListener("click", () => {
            langOptions.classList.toggle("open");
        });

        langOptionsList.forEach(option => {
            option.addEventListener("click", function() {
                langTrigger.querySelector('.selected-value').innerHTML = this.innerHTML;
                langOptions.classList.remove("open");
                langOptionsList.forEach(opt => opt.classList.remove("selected"));
                this.classList.add("selected");
            });
        });

        document.addEventListener("click", (e) => {
            if (!langTrigger.contains(e.target) && !langOptions.contains(e.target)) {
                langOptions.classList.remove("open");
            }
        });
    }

    // Custom Currency Dropdown logic
    const currTrigger = document.getElementById("currencyTrigger");
    const currOptions = document.getElementById("currencyOptions");
    const currOptionsList = currOptions ? currOptions.querySelectorAll(".custom-option") : [];

    if (currTrigger && currOptions) {
        currTrigger.addEventListener("click", () => {
            currOptions.classList.toggle("open");
        });

        currOptionsList.forEach(option => {
            option.addEventListener("click", function() {
                currTrigger.querySelector('.selected-value').innerHTML = this.innerHTML;
                currOptions.classList.remove("open");
                currOptionsList.forEach(opt => opt.classList.remove("selected"));
                this.classList.add("selected");
            });
        });

        document.addEventListener("click", (e) => {
            if (!currTrigger.contains(e.target) && !currOptions.contains(e.target)) {
                currOptions.classList.remove("open");
            }
        });
    }

    function calculatePredictor() {
        // Parse inputs
        const revenue = parseFloat(totalRevenueInput.value) || 0;
        const avgOrder = parseFloat(avgOrderValueInput.value) || 1; // prevent divide by 0
        const leadResponseRate = parseFloat(leadRateInput.value) || 1;
        const prospectResponseRate = parseFloat(prospectRateInput.value) || 1;

        // Update Slider Labels
        leadRateLabel.textContent = leadResponseRate.toFixed(2) + "%";
        prospectRateLabel.textContent = prospectResponseRate.toFixed(2) + "%";

        // Formula 01: Customers = Total Revenue / Avg Order Value
        const customers = Math.ceil(revenue / avgOrder);

        // Formula 02: Leads = Customers * 100 / Lead Response Rate
        const leads = Math.ceil((customers * 100) / leadResponseRate);

        // Formula 03: Prospects = Leads * 100 / Prospect Response Rate
        const prospects = Math.ceil((leads * 100) / prospectResponseRate);

        // Update UI Text
        customersValue.textContent = customers;
        leadsValue.textContent = leads;
        prospectsValue.textContent = prospects;

        // Calculate visual percentages mapped to the highest value (Prospects = 100%)
        let lPct = 0;
        let cPct = 0;

        if (prospects > 0) {
            lPct = (leads / prospects) * 100;
            cPct = (customers / prospects) * 100;
        }

        leadsPercent.textContent = Math.round(lPct) + "%";
        customersPercent.textContent = Math.round(cPct) + "%";

        // Update progress bar widths
        leadsBar.style.width = lPct + "%";
        customersBar.style.width = cPct + "%";

        // Draw Chart
        drawChart(prospects, leads, customers);
    }

    function drawChart(totalProspects, totalLeads, totalCustomers) {
        chartContainer.innerHTML = "";
        
        // Define axis max based on typical distribution in the screenshot
        const xAxisMax = Math.ceil(totalProspects / 20) * 20 || 120;
        const steps = 6;

        // Render Background Grid layout (horizontal and vertical)
        const gridBackground = document.createElement("div");
        gridBackground.className = "grid-background";
        
        for (let i = 0; i <= steps; i++) {
            // Vertical lines matching X-axis steps
            if (i > 0) {
                const vLine = document.createElement("div");
                vLine.className = "grid-line-vertical";
                vLine.style.left = `${(i / steps) * 100}%`;
                gridBackground.appendChild(vLine);
            }
            
            // Horizontal lines matching Y-axis rows
            if (i > 0) {
                const hLine = document.createElement("div");
                hLine.className = "grid-line-horizontal";
                hLine.style.top = `${((i - 1) / steps) * 100 + (100 / steps / 2)}%`;
                gridBackground.appendChild(hLine);
            }
        }
        chartContainer.appendChild(gridBackground);

        // Add Y-axis title (moved inside chart logic)
        const yAxisTitle = document.createElement("div");
        yAxisTitle.className = "y-axis-title";
        yAxisTitle.textContent = "Months";
        chartContainer.appendChild(yAxisTitle);
        
        for (let i = 1; i <= 6; i++) {
            // Distribute cumulative amounts across 6 months
            const monthProspects = Math.round((totalProspects / 6) * i);
            const monthLeads = Math.round((totalLeads / 6) * i);
            const monthCustomers = Math.round((totalCustomers / 6) * i);

            const pWidth = (monthProspects / xAxisMax) * 100;
            const lWidth = (monthLeads / xAxisMax) * 100;
            const cWidth = (monthCustomers / xAxisMax) * 100;

            const row = document.createElement("div");
            row.className = "chart-row";
            
            row.innerHTML = `
                <div class="y-axis-label">${i}</div>
                <div class="bar-wrapper">
                    <div class="bar-prospects" style="width: ${pWidth}%"></div>
                    <div class="bar-leads" style="width: ${lWidth}%"></div>
                    <div class="bar-customers" style="width: ${cWidth}%"></div>
                </div>
            `;

            // Tooltip interactivity
            row.addEventListener("mouseenter", (e) => {
                tooltip.style.opacity = "1";
                tooltip.innerHTML = `
                    Month #${i}<br>
                    Prospects: ${monthProspects}<br>
                    Leads: ${monthLeads}<br>
                    Customers: ${monthCustomers}
                `;
            });
            row.addEventListener("mousemove", (e) => {
                tooltip.style.left = e.pageX + 20 + "px";
                tooltip.style.top = e.pageY - 35 + "px";
            });
            row.addEventListener("mouseleave", () => {
                tooltip.style.opacity = "0";
            });

            chartContainer.appendChild(row);
        }
        
        // Render X-axis labels
        const labelsContainer = document.createElement("div");
        labelsContainer.className = "x-axis-labels";
        for (let i = 0; i <= steps; i++) {
            const val = Math.round((xAxisMax / steps) * i);
            const span = document.createElement("span");
            span.textContent = val + " people";
            span.style.left = `${(i / steps) * 100}%`;
            labelsContainer.appendChild(span);
        }
        chartContainer.appendChild(labelsContainer);
    }

    // Attach event listeners to recalculate when values change
    const inputs = [totalRevenueInput, avgOrderValueInput, leadRateInput, prospectRateInput];
    inputs.forEach(input => {
        input.addEventListener("input", calculatePredictor);
    });

    // Run initial calculation on load
    calculatePredictor();
});