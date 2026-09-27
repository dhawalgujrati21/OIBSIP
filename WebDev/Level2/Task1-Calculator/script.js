let input = document.getElementById('inputBox');
let buttons = document.querySelectorAll('button');

let string = "";
let arr = Array.from(buttons);

arr.forEach(button => {
    button.addEventListener('click', (e) => {

        if(e.target.innerHTML == "="){
            string = eval(string);
            input.value = string;
        }

        else if(e.target.innerHTML == "C"){
            string = "";
            input.value = string;
        }

        else if(e.target.innerHTML == "⌫"){
            string = string.substring(0, string.length - 1);
            input.value = string;
        }

        else{
            string += e.target.innerHTML;
            input.value = string;
        }

    })
});

document.addEventListener('keydown', (e) => {
    if(e.key === "Backspace"){
        string = string.substring(0, string.length - 1);
        input.value = string;
    }
});