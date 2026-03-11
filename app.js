let filterMode="all"
let chart
let monthChart
let editId=null

function register(){

auth.createUserWithEmailAndPassword(email.value,password.value)

.then(()=>{
alert("Registration successful. Please login.")
})

.catch(error=>{

if(error.code=="auth/email-already-in-use"){
alert("This email already exists. Please login.")
}

else if(error.code=="auth/weak-password"){
alert("Password must be at least 6 characters")
}

else{
alert(error.message)
}

})

}
function login(){

auth.signInWithEmailAndPassword(email.value,password.value)

.then(()=>{
alert("Logged in successfully")
window.location="dashboard.html"
})

.catch(error=>{

if(error.code=="auth/user-not-found"){
alert("No account found. Please register first.")
}

else if(error.code=="auth/wrong-password"){
alert("Incorrect password")
}

else if(error.code=="auth/invalid-email"){
alert("Invalid email format")
}

else{
alert(error.message)
}

})

}

function logout(){

auth.signOut().then(()=>window.location="index.html")
.then(()=>alert("Logged out successfully")) 
}

function openProfile(){

window.location="profile.html"

}

function goDashboard(){

window.location="dashboard.html"

}

auth.onAuthStateChanged(user=>{

let emailElement=document.getElementById("userEmail")

if(emailElement && user){

emailElement.innerText=user.email

}

})

function showAll(){

filterMode="all"
loadExpenses()

}

function showMonth(){

filterMode="month"
loadExpenses()

}

function addExpense(){

let user = auth.currentUser;

if(!user){
alert("User not logged in");
return;
}

let date = document.getElementById("date").value;
let category = document.getElementById("category").value;
let amount = document.getElementById("amount").value;

if(date=="" || category=="" || amount==""){
alert("Fill all fields");
return;
}

db.collection("expenses").add({

userId: user.uid,
date: date,
category: category,
amount: Number(amount)

})
.then(()=>{

alert("Expense Added");

document.getElementById("date").value="";
document.getElementById("category").value="";
document.getElementById("amount").value="";

loadExpenses();

})
.catch(error=>{

console.log(error);
alert(error.message);

});

}

function editExpense(id,d,c,a){

date.value=d
category.value=c
amount.value=a

editId=id
addBtn.innerText="Update Expense"

}

function clearForm(){

date.value=""
category.value=""
amount.value=""

}

function loadExpenses(){

let user=auth.currentUser

if(!user){

setTimeout(loadExpenses,500)
return

}

db.collection("expenses")
.where("userId","==",user.uid)
.get()

.then(snapshot=>{

let table=document.getElementById("table")
table.innerHTML=""

let total=0
let chartData={}
let monthData={}
let today=new Date()

snapshot.forEach(doc=>{

let data=doc.data()
let include=true
let d=new Date(data.date)

if(filterMode==="month"){

if(d.getMonth()!=today.getMonth()||d.getFullYear()!=today.getFullYear()){

include=false

}

}

if(include){

total+=Number(data.amount)

table.innerHTML+=`

<tr>
<td>${data.date}</td>
<td>${data.category}</td>
<td>${data.amount}</td>
<td>

<button onclick="editExpense('${doc.id}','${data.date}','${data.category}','${data.amount}')">Edit</button>

<button onclick="deleteExpense('${doc.id}')">Delete</button>

</td>
</tr>

`

}

chartData[data.category]=(chartData[data.category]||0)+Number(data.amount)

let m=data.date.substring(0,7)

monthData[m]=(monthData[m]||0)+Number(data.amount)

})

total.innerText=total

drawCharts(chartData,monthData)

generateAI(chartData)

})

}

function deleteExpense(id){

db.collection("expenses").doc(id).delete()
.then(()=>loadExpenses())

}

function drawCharts(catData,monthData){

let ctx=document.getElementById("chart")
let mctx=document.getElementById("monthChart")

if(chart) chart.destroy()
if(monthChart) monthChart.destroy()

chart=new Chart(ctx,{
type:"pie",
data:{
labels:Object.keys(catData),
datasets:[{data:Object.values(catData)}]
}
})

monthChart=new Chart(mctx,{
type:"bar",
data:{
labels:Object.keys(monthData),
datasets:[{label:"Monthly Spending",data:Object.values(monthData)}]
}
})

}

function generateAI(data){

let max=0
let cat=""

for(let c in data){

if(data[c]>max){

max=data[c]
cat=c

}

}

aiInsight.innerText="You spend most on "+cat+". Try reducing this category."

}

function exportPDF(){

const { jsPDF } = window.jspdf
let doc=new jsPDF()

doc.text("Expense Report",20,20)

let y=40

document.querySelectorAll("#table tr").forEach(row=>{

let cols=row.querySelectorAll("td")

doc.text(cols[0].innerText+"   "+cols[1].innerText+"   "+cols[2].innerText,20,y)

y+=10

})

doc.save("expenses.pdf")

}

function exportExcel(){

let data=[["Date","Category","Amount"]]

document.querySelectorAll("#table tr").forEach(row=>{

let cols=row.querySelectorAll("td")

data.push([
cols[0].innerText,
cols[1].innerText,
cols[2].innerText
])

})

let ws=XLSX.utils.aoa_to_sheet(data)
let wb=XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb,ws,"Expenses")

XLSX.writeFile(wb,"expenses.xlsx")

}