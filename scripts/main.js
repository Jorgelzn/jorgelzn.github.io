function show(string) {
    var ai = document.getElementById("ai-banner");
    var games = document.getElementById("games-banner");
    var web = document.getElementById("web-banner");

    if (string=="ai"){
        ai.style.display = "flex";
        web.style.display = "none";
        games.style.display = "none";
    }else if(string=="web"){
        ai.style.display = "none";
        web.style.display = "flex";
        games.style.display = "none";      
    }else if(string=="games"){
        ai.style.display = "none";
        web.style.display = "none";
        games.style.display = "flex";
    }
  }
  
var ai = document.getElementById("ai-banner");
var games = document.getElementById("games-banner");
var web = document.getElementById("web-banner");
ai.style.display="none";
games.style.display="none";
web.style.display="none";