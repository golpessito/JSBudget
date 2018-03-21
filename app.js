//BUDGET CONTROLLER
var budgetController = (function(){

  var Expense = function(id, description, value){
      this.id=id;
      this.description=description;
      this.value=value;
      this.percentaje = -1;
  };

  Expense.prototype.calcPercentaje = function(totalIncome){

    if(totalIncome>0){
        this.percentaje=Math.round((this.value/totalIncome)*100);
    }
    else {
      this.percentaje=-1;
    }
  };

  Expense.prototype.getPercentaje=function(){
    return this.percentaje;
  };

  var Income = function(id, description, value){
      this.id=id;
      this.description=description;
      this.value=value;
  };

  var calculateTotal=function(type){
    var sum=0;

    data.allItems[type].forEach(function(cur){
      sum=sum+cur.value;
    });

    data.totals[type]=sum;

  };

  var data = {

      allItems:{
        exp: [],
        inc: []
      },
      totals: {
        exp:0,
        inc:0
      },
      budget:0,
      percentaje:-1
  };

  return {
    addItem: function(type, des, val){
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0){
        ID=data.allItems[type][data.allItems[type].length-1].id+1;
      }
      else
      {
        ID=0;
      };


      if (type==="exp"){
        newItem=new Expense(ID, des, val);
      }
      else if (type==="inc") {
        newItem=new Income(ID, des, val);
      };

      //Push it into our data structure
      data.allItems[type].push(newItem);

      //Return new Item
      return newItem;
    },

    deleteItem: function(type, id){

      // id = 6
      // data.allItems[type][id];
      // ids = [1 2 4 6 8]
      // index = 3

      var ids=data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1){
        data.allItems[type].splice(index,1);
      };

    },

    calculateBudget: function(){
      //Calculate total incomes and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      //Calculate total budget total incomes - total expenses
      data.budget = data.totals.inc - data.totals.exp;

      //Calculate the percentaje of income thath we spent
      if(data.totals.inc > 0){
        data.percentaje= Math.round((data.totals.exp/data.totals.inc)*100);
      }
      else{
        data.percentaje=-1;
      }

    },

    calculatePercentajes: function(){
      /*
       a=20
       b=10
       c=40
       income = 100
       a=20/100=20%
       b=10/100=10%
       c=40/100=40%
      */

       data.allItems.exp.forEach(function(current){
         current.calcPercentaje(data.totals.inc);
       });

    },

    getPercentajes: function(){
      var allPorcentajes;
      allPorcentajes=data.allItems.exp.map(function(current){
        return current.getPercentaje();
      });

      return allPorcentajes;
    },

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentaje: data.percentaje
      };
    },

    testing: function(){
      console.log(data);
    }
  }

})();

//UI CONTROLLER
var UIController = (function(){

  var DOMStrings={
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentajeLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPerLabel: '.item__percentage',
    dateLabel:'.budget__title--month'
  };

  var formatNumber = function(num, type){

    var numSplit,int,dec;

    num=Math.abs(num);
    num=num.toFixed(2);
    numSplit=num.split('.');

    int=numSplit[0];

    dec=numSplit[1];

    if(int.length > 3){
      int=int.substr(0,int.length-3)+','+int.substr(1,3); //input 23500, output 23,500
    }

    return (type==='exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback){
    for (var i=0; i < list.length; i++){
      callback(list[i],i);
    }
  };

  return {
    getInput: function(){
      return {
        type:document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
        description:document.querySelector(DOMStrings.inputDescription).value,
        value:parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }
    },

    getDOMStrings: function(){
      return DOMStrings;
    },

    addListItem: function(obj, type){
      // Create HTML string with placeholder text
      var html, newHtml, element;

      if(type==="inc"){
        element=DOMStrings.incomeContainer;
        html="<div class='item clearfix' id='inc-%id%'><div class='item__description'>%description%</div> <div class='right clearfix'><div class='item__value'>%value%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
      }
      else if(type==="exp")
      {
        element=DOMStrings.expensesContainer;
        html="<div class='item clearfix' id='exp-%id%'><div class='item__description'>%description%</div> <div class='right clearfix'><div class='item__value'>%value%</div><div class='item__percentage'>10%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
      };

      //Replace the placeholder text
      newHtml=html.replace('%id%',obj.id);
      newHtml=newHtml.replace('%description%',obj.description);
      newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

      // Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },

    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function(){
      var fields, fieldsArr;

      fields=document.querySelectorAll(DOMStrings.inputDescription+ ', '+DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current,index,array){
        current.value="";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj){

      var type;

      obj.budget >  0 ? type='inc' : type='exp';

      document.querySelector(DOMStrings.budgetLabel).textContent=formatNumber(obj.budget,type);;
      document.querySelector(DOMStrings.incomeLabel).textContent=formatNumber(obj.totalInc,type);
      document.querySelector(DOMStrings.expensesLabel).textContent=formatNumber(obj.totalExp,type);

      document.querySelector(DOMStrings.percentajeLabel).textContent=obj.percentaje;

      if(obj.percentaje>=0){
        document.querySelector(DOMStrings.percentajeLabel).textContent=obj.percentaje+"%";
      }
      else {
        document.querySelector(DOMStrings.percentajeLabel).textContent="---";
      }
    },

    displayPercentajes: function(percentajes){

      var fields = document.querySelectorAll(DOMStrings.expensesPerLabel);
      console.log(fields);

      nodeListForEach(fields, function(current, index){
        if(percentajes[index]>0)
        {
          current.textContent = percentajes[index] + '%';
        }
        else {
          current.textContent = '----';
        }

      });
    },

    displayMonth: function()
    {
      var now, year, month, months;

      now = new Date();
      months=["January","Febrary","March","April",'May','June','July','August','September','October','December'];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMStrings.dateLabel).textContent=months[month]+' '+year;
    },

    changedType: function(){
      var fields = document.querySelectorAll(
        DOMStrings.inputType+','+
        DOMStrings.inputDescription+','+
        DOMStrings.inputValue);

        nodeListForEach(fields,function(cur){
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    }

  }; //return

})();

// GLOBAL APP CONTROLLER
var Controller = (function(budgetCtrl, UICtrl){

  function setUpEventListener(){

    var DOM=UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

    document.addEventListener('keypress',function(event,){
      //Only Return Key
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

  };

  var updateBudget = function(){

    var budget;

    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    budget=budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  var updatePercentajes = function(){

    //1. Calulate the percentajes
    budgetController.calculatePercentajes();

    //2. Read percentajes from budgetController
    var percentajes=budgetController.getPercentajes();

    //3. Update UI with the new percentajes
    UIController.displayPercentajes(percentajes);

  };

  var ctrlAddItem = function(){

    var input,newItem;

    // 1. Get the filled Input Data
    input=UICtrl.getInput();

    if(input.description!=="" && (!isNaN(input.value)) && input.value > 0)
    {
      // 2. Add the item to the budget controller
      newItem=budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem,input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and Update Budget
      updateBudget();

      //6. Caculate and Update Percentajes
      updatePercentajes();

    };

  };

  var ctrlDeleteItem=function(event){
    var itemID,splitID,type,id;
    itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      splitID=itemID.split('-');
      type=splitID[0];
      id=parseInt(splitID[1]);

      //1. Delete the item from data structure
      budgetCtrl.deleteItem(type,id);

      //2. Delete the item from the new budget
      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Caculate and Update Percentajes
      updatePercentajes();

    }

  };

  return {
    init: function(){
      console.log("Application has started!!");
      setUpEventListener();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentaje: -1
      });

      UIController.displayMonth();
    }
  }

})(budgetController,UIController);

// INIT APP
Controller.init();
