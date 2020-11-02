// Datatable code starts 
var initialiseTable = (function() {
    let renderData ={};
    let displayFields = [];
    let sortableFields = [];
    let filterableFields =[]
    let limitPerPage = 0;
    let activePage = 1;
    let pageCount= 1;
    let cloneData =[];
    let isheaderFixed = false;

    function createPagination() {
        pageCount = Math.floor(cloneData.length / limitPerPage);
        if((cloneData.length % limitPerPage) != 0){
            pageCount++;
        }
        renderPaginationCTA(1)
        document.querySelector("#currentList").innerText = `1 to ${limitPerPage} `;
        document.querySelector("#totalEntries").innerText = cloneData.length;
    }
    function renderPaginationCTA(strtIdx) {
        document.querySelector('.pagination-row').innerHTML = '';
        if(strtIdx > 1) {
            document.querySelector('.pagination-row').innerHTML = '';
            let ctaPrev = document.createElement("button");
            ctaPrev.classList.add("paginated-cta")
            ctaPrev.innerText = "Prev";
            ctaPrev.onclick = handlePagination;
            document.querySelector('.pagination-row').appendChild(ctaPrev)
        }
        strtIdx = strtIdx+5 <=pageCount? strtIdx :pageCount-4;
        for(var i =strtIdx; i< strtIdx+5 && i <= pageCount; i++) {
            let cta = document.createElement("button");
            cta.classList.add("paginated-cta")
            cta.innerText = i;
            cta.onclick = handlePagination;
            if(i == activePage)
                cta.classList.add("active-page")
            document.querySelector('.pagination-row').appendChild(cta)
        }
        if(i <= pageCount) {
            let ctaNext = document.createElement("button");
            ctaNext.classList.add("paginated-cta")
            ctaNext.innerText = "Next";
            ctaNext.onclick = handlePagination;
            document.querySelector('.pagination-row').appendChild(ctaNext)
        }
    }
    function handlePagination(e) {
        document.querySelectorAll(".paginated-row").forEach(function(cta) {
                cta.classList.remove("active-page")
        })
        if(e.target.innerText != "Next" && e.target.innerText != "Prev") {
            activePage = e.target.innerText;
        }
        else if (e.target.innerText == "Next")
            activePage++;
        else {
            activePage--;
        }
        document.querySelector("#currentList").innerText = `${activePage * limitPerPage - limitPerPage + 1} to ${activePage * limitPerPage <= cloneData.length ? activePage*limitPerPage : cloneData.length} `;
        renderPaginationCTA(parseInt(activePage))
        renderData = cloneData.filter(function(row,key) {
            return key >= ((activePage-1) * limitPerPage) && key < ((activePage) * limitPerPage)
        })
        renderTable(renderData)
    }
    function getSortableCTA(id) {
        let container = document.createElement('div');
        container.classList.add('sortable-cta')
        let sortA = document.createElement('div');
        sortA.innerHTML = "&#9650;"
        sortA.id = id + "-asc";
        sortA.onclick = sortData;
        let sortB = document.createElement('div');
        sortB.innerHTML = "&#9660;"
        sortB.id = id + "-des";
        sortB.onclick = sortData;
        container.appendChild(sortA)
        container.appendChild(sortB);
        return container
    }
    function renderHeader() {
        let headerContainer = document.querySelector("thead");
        displayFields.forEach(function(field) {
            let headElement = getElement("th");
            headElement.id = field;
            headElement.innerHTML = field.toUpperCase() + "<br>";
            if(filterableFields.includes(field)) {
                let searchIp = document.createElement("input");
                searchIp.type="text";
                searchIp.id = field;
                searchIp.oninput = search;
                headElement.appendChild(searchIp)
            }
            if(sortableFields.includes(field)) {
                headElement.appendChild(getSortableCTA(field))
            }
            if(isheaderFixed) {
                headElement.classList.add("sticky")
            }
            headerContainer.appendChild(headElement)
        })
    }
    function sortData(e) {
        let sortKey = e.target.id.split("-")[0];
        let sortType = e.target.id.split("-")[1];
        renderData.sort(function(a,b) {
            if(a[sortKey] > b[sortKey]) {
                if(sortType == "asc")
                    return 1
                else
                    return -1
            }
            else if(a[sortKey] < b[sortKey]) {
                if(sortType == "asc")
                    return -1
                else
                    return 1
            }
            else
                return 0;
        })
        renderTable(renderData)
    }

    function search(e) {
        let value = e.target.value && e.target.value.toLowerCase();
        let searchKey = e.target.id;
        let filterData = [];
        renderData.forEach((dataElemet)=>{
            if(dataElemet[searchKey].toLowerCase().includes(value)) {
                filterData.push(dataElemet);
            }
        })
        renderTable(filterData)
    }

    function getElement (type = "td") {
        let ele = document.createElement(type);
        return ele;
    }
    function getRowContainer () {
        let ele = document.createElement("tr");
        return ele;   
    }
    function renderTable(configObj) {
        document.querySelector('.table-body').innerHTML = '';
        configObj && configObj.forEach((elementConfig, key)=>{
            createRow(elementConfig)
        })
    }

    function createRow(inputConfig) {
        let tableRow = getRowContainer();
        displayFields.forEach(function(key) {
            let dataElement = getElement();
            dataElement.innerText = inputConfig[key];
            tableRow.appendChild(dataElement);
        })
        document.querySelector('.table-body').appendChild(tableRow)
    }

    function initialiseDataTable(dataset,config) {
        renderData = config.isPaginated ? dataset.slice(0,config.limitPerPage) : dataset;
        cloneData = JSON.parse(JSON.stringify(dataset));
        displayFields = config.displayFields;
        sortableFields = config.sortableFields;
        filterableFields = config.filterableFields;
        limitPerPage = config.limitPerPage;
        activePage = 1;
        pageCount= 1;
        isheaderFixed = config.fixHeader;
        renderHeader()
        renderTable(renderData);
        config.isPaginated && createPagination();        
    }
    return initialiseDataTable;
})();

// Datatable code ends

// Helper function to get data
function fetchData() {
    return fetch('https://restcountries.eu/rest/v2/all').then((res)=>{
        return res.json();
    }).then((parsedRes)=>{
        return parsedRes;
    })
}

// Initialising the datatable
document.addEventListener("DOMContentLoaded", function(e) {
    fetchData().then((serverData)=>{
        let dataset = serverData;
        let config = {
            displayFields:["name","capital","region","population","area"],
            sortableFields:["name","population"],
            limitPerPage:15,
            filterableFields:["name","capital"],
            isPaginated:true,
            fixHeader:false
        }
        initialiseTable(dataset,config)
    })
})

