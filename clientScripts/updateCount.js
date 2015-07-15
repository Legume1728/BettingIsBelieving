/*if (parseInt(betQueryWindow.dict[Object.keys(betQueryWindow.dict).sort()[0]].percent.shape.text)>=price){
}*/

buyShares=function(){
    if (prevIsFreePeriod){
	return
    }
    else
    {
	/*
	  A version of the Becker-DeGroot-Marschak mechanism:

	  The computer picks a number (here called price, which is assigned to points)
	  The points are then compared to the user's prediction of the betting variable being heigh
	  If points > prediction => the user earnes points (effectively sells his one share)
	  Else the user engages in the gamble that payes off 100, if the betting variable turns out to be H, else 0.
	  (i.e. he does not buy any shares at all, he just sells his one share if he doesn't want to hold or else keeps it. 
	  */
	var valToBetOn = share_val;
	var points = price;
	//alert(price)
	//The Becker-DeGroot-Marschak mechanism has no buying; only selling
	//var newShares =(user.points-user.points%points)/points;
	//var bayesVar = betView.bayesVar;
	var vars = modelClass.vars;
	var queryPath = "";
	var conditionalVarNames = modelClass.vars.slice(0,modelClass.vars.indexOf(bettingVar)).concat(modelClass.vars.slice(modelClass.vars.indexOf(bettingVar)+1, modelClass.vars.length));
	var predictionVar = truth[truth.length-1]['betting_var'];
    
	conditionalVarNames.map(function(na)
				{
				    queryPath += "/" + na + ":" + truth[truth.length-1][na];
				});
	   
	$.ajax({
            type: "GET",
            url: '/js/query' + queryPath,
            async: true,
        
            dataType: "json",
            success: function(data)
            {
		if (typeof(data) === "object")
		{
                    var prediction = data[bettingVar];
                    var currentKeys=Object.keys(prediction);
                    currentKeys.sort();
                    threshHold=Math.round(prediction[currentKeys[0]]*100);
                    //alert(threshHold)
                    if (points in range(threshHold + 1))
                    {         
			pointWindow.shares.changeText("1")
			//hold: do nothing

			/*$.ajax({
                            type: "post",
                            url: '/js/newpost',
                            async: true,
                            data:JSON.stringify({"user_id": user.id, "treatmentNum": treatmentNum, "valToBetOn": valToBetOn, 'price': points, 'shares':newShares,  'period': truth[truth.length-1].period}),
                            dataType: "json",
                            dataType: "json",
                            contentType: "application/json",
                            success: function(){ } 
			});*/
                    }
                    else
                    {
			/*if (user.points-points<=0)
			{
			    return //warn("You have no points to buy shares with.");
			    //updatePoints()
			}
			else
			{*/
			if (user.shares>=1) 
                        {
			    
			    $.ajax({
                                type: "post",
                                url: '/js/newput',
                                async: true,
                                data:JSON.stringify({"user_id": user.id, "treatmentNum": treatmentNum, "valToBetOn": valToBetOn, 'price': points, 'shares':user.shares, 'period': truth[truth.length-1].period}),
                                dataType: "json",
                                contentType: "application/json",
                                success: function(){pointWindow.shares.changeText("0");}   
			    });
				
                        }
			else {return}
			//warn("The current price of " + JSON.stringify(points) + " points \nexceeds your buying threshold of " + JSON.stringify(threshHold) + " points.\n\nIf you want to buy at the current price,\nyou must change your model!");
			//updatePoints()
		    
                    }
		}
		else {
                    return //warn(JSON.stringify(data));
		}
            }
	})
    }
}

updateCount = function(dataView)
{
    //updateQueryPrediction();
    checkFreePeriod();
    var view = dataView;
    var currPeriod = getCurrTimePeriod();
    //buyShares()
    $.ajax({
        type: "GET",
        url: '/js/newData/' + treatmentNum + "/" + currPeriod,
        dataType: "json",
        async: true, //options.sync,
        success: function(data)
        {
            var timeUntilNextData = 120;
	    //buyShares()
            if (obtainedTruth && data['dataAvail'])
            {
		//buyShares()
                if (data['newData'][1].period !== truth[truth.length-1].period)
                {
		    
		    //alert(price);
		    //buyShares()
		    data['newData'][0]['price']=price;
		    //this is a hack; it would be better to come correctly ...I'll fix that later, if ever. 
		    //alert(JSON.stringify(data['newData']))
			addDataToDataWindow(data['newData']);
                }
                timeUntilNextData = 120;
            }
            else
            {
                timeUntilNextData = data['timeUntilNextData'];
            }
            var minLeft = Math.floor(timeUntilNextData/60);
            var secLeft = timeUntilNextData % 60;
	    if (minLeft===0 && secLeft<=5) {
		if (!prevIsFreePeriod)
		{
		    buyShares()
		}
		else{
		    //return //alert("yo")
		}
	    }
            countDown.text.changeText("New data in " + timeUntilNextData + " seconds");
	    //countDown.renderW(view, Point((view.width - countDown.text.width)/2, view.height-90));
        }
    });
}

function checkFreePeriod()
{
    $.ajax({
        type: "GET",
        url: '/js/isFreePeriod',
        dataType: "json",
        async: true, //options.sync,
        success: function(data) {
            var isFreePeriod = data['free_period'];
            if (isFreePeriod)
            {
                if (buyButton.isRendered()) {
                    buyButton.erase();
                }
                if (priceTag.isRendered()) {
                    priceTag.erase();
                }
                if (sellButton.isRendered()) {
                    sellButton.erase();
                }
                //if (putsWindow.isRendered()) {
                  //  putsWindow.erase();
                //}
            } else if (prevIsFreePeriod) {
                //buyButton.render(stage, {x:buyButton.xPos, y:25});
		//priceTag.render(stage, {x:buyButton.xPos + 90, y:25});
		//buyShares()
                //buyButton.callback.call()
                //sellButton.render(stage, {x:sellButton.xPos, y:25});
                //sellButton.callback.call()
            }
            prevIsFreePeriod = isFreePeriod;
        }
    });
}

// newDataSets[0] is confirmation of the previous data with the value of
//      the betting variable revealed
// newDataSets[1] is new data for the current time period
function addDataToDataWindow(newDataSets)
{   
    var newTruth1 = newDataSets[0];
    var newTruth2 = newDataSets[1];
    var userShares=user.shares;
    newTruth1.yCoord = truth[truth.length-1].yCoord;
    newTruth2.yCoord = truth[truth.length-1].yCoord + 40;
    truth = truth.slice(0, truth.length-1).concat([newTruth1, newTruth2]);
    dataWindow.data = dataWindow.data.slice(0, dataWindow.data.length-1).concat(newDataSets);
    
    countDown.erase()
    dataWindow.frame.erase();
    dataWindow.frameHeight += 40;
    dataWindow.drawInnerFrame();

    dataWindow.frame = makeFrameWidgetWide( 
        dataWindow.height-80, dataWindow.width,
        dataWindow.innerFrame, dataWindow.frameHeight);

    dataWindow.frame.render(dataWindow.shape, {x:0, y:0});
    
    countDown.renderW(dataWindow, Point((dataWindow.width - countDown.text.width)/2, dataWindow.height-90));

    var totalWinnings = 0;
    bettingVar = truth[truth.length-1]['betting_var'];
    //truth[truth.length-1]['price']
    predictionVar=bettingVar;
    //buyShares()
    //use this
    updatePoints();

    
    //updatePointWindow()
    
    if (truth[truth.length-2][truth[truth.length-2]['betting_var']] !== share_val)
    {
	//alert("false")
        updateScoreTag(false);
    }
    else
    {
	//alert("true")
        updateScoreTag(true);
    }
    setShareVal();
}

function initializeModel(GraphJson)
{
    model = {};
    model.id = user.id;
    model[user.id] = GraphJson;
    storedModel = "";

    // make a copy of the model
    // When model is updated, storedModel also updated
    // but storedModel may be briefly different from model
    
    sendModelIfUpdated();
}

function sendModelIfUpdated()
{
    if (JSON.stringify(storedModel) !== JSON.stringify(model))
    {
        storedModel = JSON.parse(JSON.stringify(model));
        $.ajax({
            type: "post",
            url: '/js/model',
            async: true,
            data:JSON.stringify(model),
            dataType: "json",
            contentType: "application/json",
            success: function(data){
		if(JSON.stringify(data)!=="{}")
		{warn("Cyclical Models are not allowed!")}
	    }
        });
    }
}

function sendScoreUpdate()
{ 
    $.ajax({
        type: "post",
        url: '/js/score',
        async: true,
        data:JSON.stringify({"score": user.score, "period":truth[truth.length-1]['period'], "user_id":user.id}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
	    
	}
    });
}

function updatePoints()
{
    
    $.ajax({
        type: "GET",
        url: '/js/truth',
	//data: JSON.stringify({'password': password}),
        //data: JSON.stringify({'asdf': 'sdfg', 'someinfo2': 'hello world2'}),
        async: true,
        dataType: "json",
        success: function(data)
        {
	    //buyShares();
            //user.score= data['score'];
            user.points= data['points']; //The Becker-DeGroot-Marschak mechanism needs no points.
            user.shares= data['shares']; //There is always just one share
	    price = data['price'];
	    truth[truth.length-1]["price"]=price;
	    priceTag.changeText("Current Price: " + JSON.stringify(price) + " points");
	}
    })
}

function updateScoreTag(sharesEarnedWinnings)
{
    
    if (prevIsFreePeriod || !scoreTagDrawn) { return; }
    var newWinnings;
    
    if (sharesEarnedWinnings)
    {
	message ="The betting variable for the last period was " + truth[truth.length-2]['betting_var'].replace("_", " ").capitalize() + ". It took on the value 'H'.\n\n";

	if (parseInt(pointWindow.shares.shape.text.split(" ")[0])>0){
	    message+="Your prediction of the value 'H' exceeded the random number the computer drew: " + JSON.stringify(truth[truth.length-2]['price']) + ".\n\n";
            newWinnings= 100;
	    message+= "and you won " + JSON.stringify(newWinnings) + " points.";
	}
	else {
	    message+="Your prediction of the value 'H' was below the random number drawn by the computer:\n\n";
	    newWinnings= truth[truth.length-2]['price']; //parseInt(pointWindow.points.shape.text.split(" ")[0]);
	    message+= "          " + JSON.stringify(newWinnings) + "\n\nand thus you win " + JSON.stringify(newWinnings) + "  points.";
	}
	warn(message);
    }
    else
    {
	message ="The betting variable was " + truth[truth.length-2]['betting_var'].replace("_", " ").capitalize() + ".\n\n" + "It took the value 'L'.\n\n";
	if (parseInt(pointWindow.shares.shape.text.split(" ")[0])>0){
	    message+="Your prediction of the value 'H' exceeded the random number the computer drew: " + JSON.stringify(truth[truth.length-2]['price']) + ".\n\n";
            newWinnings= 0;
	    message+= "and you won " + JSON.stringify(newWinnings) + " points.";
	}
	else {
	    message+="Your prediction of the value 'H' was below the random number drawn by the computer:\n\n";
	    newWinnings= truth[truth.length-2]['price']; //parseInt(pointWindow.points.shape.text.split(" ")[0]);
	    message+= "          " + JSON.stringify(newWinnings) + "\n\nand thus you win " + JSON.stringify(newWinnings) + "  points.";
	}
	warn(message);
    }
    /*newWinnings = truth[truth.length-2]['price']; //parseInt(pointWindow.points.shape.text.split(" ")[0]);
    message+="Your prediction was below the random number drawn by the computer:\n\n";
    message+= "    " + JSON.stringify(newWinnings) + "\n\nand thus you win " + JSON.stringify(newWinnings) + "  points.";
	warn(message);

    }*/
    user.score += newWinnings;
    sendScoreUpdate()
    //UpdateScoreDataBase. AJAX
    scoreTag.score.changeText(JSON.stringify(user.score));
    var scoreLength = JSON.stringify(scoreTag.score.shape.text).length*4;
    scoreTag.shape.graphics.clear();
    var g = scoreTag.shape.graphics.beginFill("white");
    
    g.beginStroke("black").setStrokeStyle(0.5);

    g.moveTo(10, 8).lineTo(10, 14);
    g.lineTo(6, 17)
    g.lineTo(10, 20)
    g.lineTo(10, 26)
    g.lineTo(10 + scoreLength + 16, 26)
    g.lineTo(10 + scoreLength + 16, 8).closePath();

    g.endStroke("black");
    g.endFill();
}

function startCountDownText(view)
{

    var num = 2
    countDown = WidgetHL();
    countDown.text = makeTextWidget("New data in "+ num + " minutes", 12, "Arial", "#666");
    countDown.background = makeRect(countDown.text.width + 10, 20, '#FFFFFF'/*'#EBEEF4'*/);
    countDown.background.renderW(countDown, Point(0, 0));
    countDown.text.renderW(countDown, Point(5, 5));
    countDown.renderW(view, Point((view.width - countDown.text.width)/2, view.height-90));
}

function setShareVal()
{
    if (isMonty)
    {
        if (truth[truth.length-1]['monty_door']==='A')
        {
            share_val = 'B';
        }
        else
        {
            share_val = 'A';
        }
    } else {
        share_val = 'H';
    }
}

