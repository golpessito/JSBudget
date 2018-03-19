//BUDGET CONTROLLER
var budgetController = (function(){

  var Expense = function(id, description, value){
      this.id=id;
      this.description=description;
      this.value=value;
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
    percentajeLabel: '.budget__expenses--percentage'
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
        html="<div class='item clearfix' id='income-%id%'><div class='item__description'>%description%</div> <div class='right clearfix'><div class='item__value'>%value%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
      }
      else if(type==="exp")
      {
        element=DOMStrings.expensesContainer;
        html="<div class='item clearfix' id='expense-%id%'><div class='item__description'>%description%</div> <div class='right clearfix'><div class='item__value'>%value%</div><div class='item__delete'><button class='item__delete--btn'><i class='ion-ios-close-outline'></i></button></div></div></div>";
      };

      //Replace the placeholder text
      newHtml=html.replace('%id%',obj.id);
      newHtml=newHtml.replace('%description%',obj.description);
      newHtml=newHtml.replace('%value%',obj.value);

      // Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
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
      document.querySelector(DOMStrings.budgetLabel).textContent=obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent=obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent=obj.totalExp;
      document.querySelector(DOMStrings.percentajeLabel).textContent=obj.percentaje;

      if(obj.percentaje>=0){
        document.querySelector(DOMStrings.percentajeLabel).textContent=obj.percentaje+"%";
      }
      else {
        document.querySelector(DOMStrings.percentajeLabel).textContent="---";
      }

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

  };

  var updateBudget = function(){

    var budget;

    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    budget=budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  }

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
    };

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
    }
  }

})(budgetController,UIController);

// INIT APP
Controller.init();
