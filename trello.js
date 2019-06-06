const key = "329822ebbdc5a5a0d7c98c1a34b5f6b2";
const token = "cbe40801985e6c968e3f83fcf471ffb61eeee15b3dbc7322df3478209819679f";
const authorization = `key=${key}&token=${token}`;
$(document).ready(function () {
    var data = null;
    var checklists = [];
    var ourRequest = new XMLHttpRequest();
    var url = `https://api.trello.com/1/members/me/boards/?${authorization}`;

    function sendGetRequest(url) {
        return new Promise(function (resolve, reject) {
            ourRequest.addEventListener("readystatechange", function () {
                if (ourRequest.readyState == ourRequest.DONE)
                    resolve(JSON.parse(ourRequest.responseText));
                // else
                //     reject('Something went wrong' + ourRequest.responseText)
            });
            ourRequest.open("GET", url);
            ourRequest.send();
        })
    }

    function sendPutRequest(url) {
        return new Promise(function (resolve, reject) {
            ourRequest.addEventListener("readystatechange", function () {
                if (ourRequest.readyState == ourRequest.DONE)
                    resolve(ourRequest.responseText);
                // else
                //     reject('Something went wrong'  + ourRequest.responseText )
            });
            ourRequest.open("PUT", url);
            ourRequest.send();
        });
    }

    function sendPostRequest(url) {
        return new Promise(function (resolve, reject) {
            ourRequest.addEventListener("readystatechange", function () {
                if (ourRequest.readyState == ourRequest.DONE)
                    resolve(ourRequest.responseText);
            //     else
            //         reject('Something went wrong'  + ourRequest.responseText )
             });
            ourRequest.open("POST", url);
            ourRequest.send(data);
        })
    }

    function sendDeleteRequest(url) {
        return new Promise(function (resolve, reject) {
            ourRequest.addEventListener("readystatechange", function () {
                if (ourRequest.readyState == ourRequest.DONE)
                    resolve(ourRequest.responseText);
                // else
                // reject('Something went wrong'  + ourRequest.responseText )
            });
            ourRequest.open("DELETE", url);
            ourRequest.send();
        });
    }

    function addItem(checkListId) {
        var myText = document.getElementById("textData").value;

        url = `https://api.trello.com/1/checklists/${checkListId}/checkItems?name=${myText}&pos=bottom&${authorization}`

        sendPostRequest(url).then(function (result) {
            $("#checklist").append(`<li><input type="checkbox" > <span class="data">${myText}</span>`);
        });
    }


    sendGetRequest(url).then(function (boards) {
        return boards[0].id;
    }).then(function (myBoardId) {
        url = `https://api.trello.com/1/boards/${myBoardId}/lists/?${authorization}`

        sendGetRequest(url).then(function (lists) {
            url = `https://api.trello.com/1/lists/${lists[0].id}/?${authorization}`

            sendGetRequest(url).then(function (todoList) {
                url = `https://api.trello.com/1/lists/${todoList.id}/cards/?${authorization}`

                sendGetRequest(url).then(function (allCards) {

                    $("#card-select").append(`<select data="${allCards[0].id}">`)
                    allCards.map(function (card) {
                        $("select").append(`<option value="${card.id}">${card.name}</option>`)
                    })
                    $("#card-select").append('</select>')
                    $("select").on('change', function () {
                        var selectedCard = $("select").children('option').filter(':selected')
                        let cardId = selectedCard.val();
                        url = `https://api.trello.com/1/cards/${cardId}/checklists/?${authorization}`
                        $(document).on("click", ".checkItem-closer", function (event) {
                            let id_item = event.target.id;
                            event.target.closest("li").remove();
                            url = `https://api.trello.com/1/cards/${cardId}/checkItem/${id_item}/?${authorization}`

                            sendDeleteRequest(url).then(function (result) {})
                        })
                        sendGetRequest(url).then(function (checklists) {
                            let checkListItems = checklists[0].checkItems;
                            $("#checklist").empty();
                            checkListItems.map(function (item) {
                                let str = `<div id="listCheckbox"><input type="checkbox" class="checkbox"  id="${item.id}" value=${item.id}></div>`
                                if (item.state == "complete")
                                    str = `<div id="listCheckbox"><input type="checkbox"  class="checkbox" id="${item.id}" value=${item.id} checked></div>`
                                $("#checklist").append(`<li>${str}<span class="data">${item.name}</span> <input type="button" name="name" class="checkItem-closer" id="${item.id}" value="Remove" ></li>`);
                            })
                            $("#add-button").click(function () {
                                addItem(checklists[0].id);
                            });
                            $('input[type="checkbox"]').click(function () {
                                if ($(this).prop("checked") == true) {
                                    url = `https://api.trello.com/1/cards/${checklists[0].idCard}/checkItem/${this.value}/?state=complete&${authorization}`
                                    sendPutRequest(url).then(function (result) {})
                                } else {
                                    url = `https://api.trello.com/1/cards/${checklists[0].idCard}/checkItem/${this.value}/?state=incomplete&${authorization}`
                                    sendPutRequest(url).then(function (result) {})
                                }
                            })
                        })
                    })
                })
            })
        })
    })
});