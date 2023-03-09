const Form = document.querySelector('.form-add');
const Inputs = document.querySelectorAll('.f-input');
const Steps = document.querySelectorAll('.f-step');

const M_Form = document.querySelector('.form-save');
const M_Inputs = document.querySelectorAll('.m-input');
const M_Steps = document.querySelectorAll('.m-step');

const Table = document.querySelector('.table-body');
const TableCalc = document.querySelector('.table-calc');

const Popup = document.querySelector('.popup-wrap');

const CalcBtn = document.querySelector('.calc-btn');
const TypesSelect = document.querySelector('#types_items');

const [ stepsArea, doubleArea ] = document.querySelectorAll('.steps-area, .double-area');


let Data = [];
let cntItem = {};

const TypesCategories = [
    {
        id: 'AG.W', 
        title: 'Перегородка',
        steps: true,
        doubleFrame: true
    },
    {
        id: 'AG.L', 
        title: 'Облицовка',
        steps: true,
        doubleFrame: true
    },
    {
        id: 3, 
        title: 'Потолок',
        steps: false,
        doubleFrame: true
    },
    {
        id: 4, 
        title: 'Пол',
        steps: false,
        doubleFrame: false
    }
];


const TypesItems = [
    {
        id: 101, 
        title: 'Перегородка на одинарном каркасе 50 м',
        c_id: 'AG.W'
    },
    {
        id: 2, 
        title: 'Перегородка 2',
        c_id: 1
    },
    {
        id: 3, 
        title: 'Перегородка 3',
        c_id: 1
    },
    {
        id: 4, 
        title: 'Облицовка 1',
        c_id: 2
    },
    {
        id: 5, 
        title: 'Облицовка 2',
        c_id: 2
    },
    {
        id: 6, 
        title: 'Потолок 1',
        c_id: 3
    },
    {
        id: 7, 
        title: 'Потолок 2',
        c_id: 3
    },
    {
        id: 8, 
        title: 'Пол 1',
        c_id: 4
    },
    {
        id: 9, 
        title: 'Пол 2',
        c_id: 4
    }
];


 // function fn()
    // {
    //     return true;
    // }

    // const fn2 = () => true; //=> return




async function request(url, method, data, callback)
{
    let setting = null;

    if(method != 'get')
        setting = {
            method,
            body: JSON.stringify(data)
        }

     let res = await fetch(url, setting);   
     let res_data  = await res.json() //json parse

     callback(res_data);
}

function getFormInputs(Cnt, Inputs, Steps)
{
    Inputs.forEach((inp) => {
        if(inp.name == 'doubleFrame')
            Cnt.doubleFrame = inp.checked;
        else if(inp.name != 'step')
            Cnt[inp.name] = inp.value;
        
    })

    Cnt.lenx = Number(Cnt.lenx);
    Cnt.leny = Number(Cnt.leny);
    

    Cnt.step = Number(Array.from(Steps).find((el) => el.checked).value); //Преобразовываем Nodelist в Array чтобы можно было пользоваться методами массива Array

    return Cnt;

}


function addContstuction(e)
{
    e.preventDefault(); //отмена действия по умолчанию (отправки формы)

    let Cnt = {
        idRow: 'id-' + Date.now()
    }

    Cnt = getFormInputs(Cnt, Inputs, Steps);

    console.log(Cnt);

    request('http://localhost:8080/constr', 'post', Cnt, renderTable)

}

function editConstrution(e)
{
    console.log('ok')

    if(e.target.classList.contains('btn-remove'))
    {
        request(`http://localhost:8080/constr/${e.target.value}`, 'post', null, renderTable);
    }
    else if(e.target.classList.contains('btn-edit'))
    {
        Popup.classList.add('visible');
        setEditForm(e.target.value);
    }
}

function setEditForm(id)
{
    cntItem = Data.find((el) => el.idRow == id);

    console.log(cntItem)

    for(let key in cntItem)
    {
        if(key != 'idRow' && key != 'id')
        {
            if(key == 'step')
            {
                Popup.querySelectorAll(`.${key}`).forEach((step) => {
                    if(step.value == cntItem[key])
                        step.checked = true;
                })
            }
            else if(key == 'doubleFrame')
            {
                Popup.querySelector(`.${key}`).checked = cntItem[key];
            }
            else
            {
                Popup.querySelector(`.${key}`).value = cntItem[key];
            }
        }
            
    }

    Popup.querySelector('.btn-save').value = cntItem.idRow;
}

function saveConstruction(e)
{   
    e.preventDefault();

    let Cnt = getFormInputs(cntItem, M_Inputs,  M_Steps);

    console.log(Cnt)

    request(`http://localhost:8080/constr/change/${Cnt.idRow}`, 'post', Cnt, renderTable)

    closePopup();
}


function closePopup()
{
    Popup.classList.remove('visible');
}


// =>  return
const getRow = (data) => (` 
    <tr>
        <td>${data.name}</td>
        <td>${data.lenx}</td>
        <td>${data.leny}</td>
        <td>${data.step}</td>
        <td>${data.doubleFrame}</td>
        <td>
            <button class="btn btn-success btn-edit" value="${data.idRow}">Edit</button>
            <button class="btn btn-danger btn-remove" value="${data.idRow}">Remove</button>
        </td>
    </tr>
`)


const getCalcRow = (data) => (` 
    <tr>
        <td>${data.name}</td>
        <td>${data.quantity}</td>
        <td>${data.units}</td>
    </tr>
`)


const getOption = (data) => (` 
    <option value="${data.id}">${data.title}</option>
`)


function renderTable(data = Data, Out = Table, template = getRow)
{

    Data = data;

    Out.innerHTML = '';

    if(Data.length)
    {
        Data.forEach((el) => {
            Out.innerHTML += template(el);
        })
    }
    else
    {
        Out.innerHTML = `<h2 class="text-muted">No data</h2>`
    }
}

// '/update-const/id'

function calcConstruction()
{
    request('http://localhost:8080/constr/calc', 'get', null, (data) => {
        console.log(data)

        renderTable(data, TableCalc, getCalcRow);
    })
}


function changeType()
{
    let type = TypesCategories.find((el) => el.id == this.value);

    console.log(type);

    stepsArea.style.display = type.steps ? 'block' : 'none';
    doubleArea.style.display = type.doubleFrame ? 'block' : 'none';

}

function changeType1()
{
    let type = TypesCategories.find((el) => el.id == this.value);

    console.log(type);

    stepsArea.style.display = type.steps ? 'block' : 'none';
    doubleArea.style.display = type.doubleFrame ? 'block' : 'none';

}




request('http://localhost:8080/constr', 'get', null, renderTable);

Form.onsubmit = addContstuction;
M_Form.onsubmit = saveConstruction;
Table.onclick = editConstrution;
Popup.querySelector('.popup-close').onclick = closePopup;
Popup.querySelector('.btn-save')
CalcBtn.onclick = calcConstruction;
TypesSelect.onchange = changeType;


renderTable(TypesCategories, TypesSelect, getOption);


//hello how are you?