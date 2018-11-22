/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018
This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode
For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk
// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
var cCAGridInitialiser = function(){
	
	this.init = function(poGrid, piInitType){
		
		//always blank first
		if (piInitType !== cCAConsts.init_values.blank)
			this.init(poGrid,cCAConsts.init_values.blank);
		
		switch(piInitType){
			case cCAConsts.init_values.blank:
				for (var ir=1; ir<= poGrid.rows; ir++)
					for (var ic=1; ic<= poGrid.cols; ic++){
						var oCell = poGrid.getCell(ir,ic,true);
						if (oCell) oCell.clear();
					}
				poGrid.non_zero_count = 0;
				poGrid.changed_cells = [];
				bean.fire(poGrid,cCAConsts.events.clear);
				break;
				
			//------------------------------------------------------
			case cCAConsts.init_values.horiz_line:
				var ir = Math.floor(poGrid.rows / 2);
				for (var ic=1; ic<= poGrid.cols; ic++)
					poGrid.setCellValue(ir,ic,true,1);
				break;
				
			//------------------------------------------------------
			case cCAConsts.init_values.diagonal:
				for (var ir=1; ir<= poGrid.rows; ir++){
					if (ir>poGrid.cols) break;
					poGrid.setCellValue(ir,ir,true,1);
				}
				break;
			//------------------------------------------------------
			case cCAConsts.init_values.diamond:
				var icc = Math.floor(poGrid.cols / 2);
				var icr = Math.floor(poGrid.rows / 2);
				
				for (var i=10; i>= 0; i--){
					var dx = i;
					var dy = 10 - dx;
					
					poGrid.setCellValue(icr-dy,icc-dx,true,1);
					poGrid.setCellValue(icr-dy,icc+dx,true,1);
					poGrid.setCellValue(icr+dy,icc-dx,true,1);
					poGrid.setCellValue(icr+dy,icc+dx,true,1);
				}
				
				break;
				
			//------------------------------------------------------
			case cCAConsts.init_values.vert_line:
				var ic = Math.floor(poGrid.cols / 2);
				for (var ir=1; ir<= poGrid.cols; ir++)
					poGrid.setCellValue(ir,ic,true,1);
				break;
				
			//------------------------------------------------------
			case cCAConsts.init_values.block:
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				for (var ic=iMidC; ic<= iMidC+1; ic++)
					for (var ir=iMidR; ir<= iMidR+1; ir++)
						poGrid.setCellValue(ir,ic,true,1);
				poGrid.non_zero_count = 4;
				poGrid.changed_count = 4;
				break;
				
			//------------------------------------------------------
			case cCAConsts.init_values.circle:
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				
				for (x=7; x>=0; x--){
					y = Math.sqrt( 49 - Math.pow(x,2));
					y = Math.round(Math.abs(y));
					poGrid.setCellValue(iMidR+y,iMidC-x,true,1);
					poGrid.setCellValue(iMidR-y,iMidC-x,true,1);
					poGrid.setCellValue(iMidR+y,iMidC+x,true,1);
					poGrid.setCellValue(iMidR-y,iMidC+x,true,1);
				}
			break;
			
			//------------------------------------------------------
			case cCAConsts.init_values.cross:
				var iMidC = Math.floor( poGrid.cols/2);
				var iMidR = Math.floor( poGrid.rows/2);
				
				poGrid.setCellValue(iMidR,iMidC,true,1);
				for (var i=1; i<= 4; i++){
					poGrid.setCellValue(iMidR+i,iMidC,true,1);
					poGrid.setCellValue(iMidR-i,iMidC,true,1);
					poGrid.setCellValue(iMidR,iMidC+i,true,1);
					poGrid.setCellValue(iMidR,iMidC-i,true,1);
				}

				poGrid.non_zero_count = 17;
				poGrid.changed_count = 17;
				break;
				
			//--------------------------------------------------------
			case cCAConsts.init_values.random:
				for (var ir=1; ir<= poGrid.rows; ir++)
					for (var ic=1; ic<= poGrid.cols; ic++){
						var iRnd = Math.round(Math.random());
						poGrid.setCellValue(ir,ic,true,iRnd);
						poGrid.non_zero_count += iRnd;
					}
				poGrid.changed_count = poGrid.non_zero_count;
				break;
			//--------------------------------------------------------
			case cCAConsts.init_values.sine:
				var dRadian= 2*Math.PI/poGrid.cols;
				var iMidR = Math.floor( poGrid.rows/2);
				var iRad = 0;
				var iMidrow = Math.round(poGrid.rows/2);
				
				for (var ic=1; ic<= poGrid.cols; ic++){
					var fSin = Math.sin(iRad);					
					var ir = iMidrow + Math.round(fSin * iMidrow);
					poGrid.setCellValue(ir,ic,true,1);
					iRad += dRadian;
				}
				break;
			//--------------------------------------------------------
			default:
				throw new CAException("unknown init_type: " + piInitType);
		}
	}
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
var cCAGrid = function(piRows, piCols){
	//#######################################################################
	//# instance variables
	//#######################################################################
	this.rows = piRows;
	this.cols = piCols;
	this.rule = null;
	this.changed_cells = null;
	this.running = false;
	this.status = new cCARunData();
	
	this.privates = {
		iLastRow : -1,
		oLastRow :null,
		cell_data:new Map(),
	};
	
	//#######################################################################
	//# methods
	//#######################################################################
	this.action = function(piAction){
		if (this.rule == null) throw new CAException("no rule set");
		
		cDebug.write("running action: " + piAction);
		switch (piAction){
			case cCAConsts.action_types.play:
				if (this.running) throw new CAException("CA is allready running");
				this.running = true;
				this.step();
				this.status.runs = 1;
				break;
			case cCAConsts.action_types.stop:
				if (! this.running)
					throw new CAException("CA is not running");
				this.running = false;
				break;
			case cCAConsts.action_types.step:
				this.step();
				break;
			default:
				throw new CAException("action not recognised: " + piAction);
		}
		cDebug.write("done action: " + piAction);
	},
	
	//****************************************************************
	this.set_rule = function(poRule){
		this.rule = poRule;
		
		//clear rules from all cells
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,false);
				if (oCell) oCell.rule = null;
			}
	}
	
	//****************************************************************
	this.notify_drawn = function(){
		var oThis = this;
		if (this.running){
			cDebug.write("running again");
			this.status.runs ++;
			setTimeout(function(){ oThis.step();}, 50);
		}else
			cDebug.write("not running again");
	}

	//****************************************************************
	this.step = function(){
		var oRule = this.rule;
		var oStatus = this.status;
		
		this.changed_cells = [];
		this.status.changed = 0;
		this.status.active = 0;
		
		cDebug.write("stepping");
		//apply rules
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,true);
				if (oCell.rule == null) oCell.rule = this.rule;
				if (oCell.apply_rule()){
					this.changed_count++;
					this.changed_cells.push(oCell);
				}
				if (oCell.value > 0) oStatus.active ++;
			}

		//promote changed cells
		var iChangedLen = this.changed_cells.length;
		this.status.changed = iChangedLen;
		if (iChangedLen == 0){
			this.running = false;
			bean.fire(this,cCAConsts.events.nochange);
			return;
		}
		
		for ( var ic = 0; ic < iChangedLen; ic++){
			var oCell = this.changed_cells[ic];
			oCell.promote();
			if (oCell.value == 0) 
				oStatus.active --;
			else
				oStatus.active ++;
		}
		bean.fire(this,cCAConsts.events.done, oStatus);
	};
	
	//****************************************************************
	this.init = function(piInitType){
		this.changed_cells = [];

		var oRule = this.rule;
		cDebug.write("initialising grid:" + piInitType);
		var oInitialiser = new cCAGridInitialiser();
		oInitialiser.init(this,piInitType);
		cDebug.write("done init grid: "+ piInitType);
		bean.fire(this,cCAConsts.events.done);
	};
	
	//****************************************************************
	this.link_cells = function(piNeighbourType){
		cDebug.write("linking cells");
		for (var ir=1; ir<= this.rows; ir++)
			for (var ic=1; ic<= this.cols; ic++){
				var oCell = this.getCell(ir,ic,false);
				this.pr__link_cell(oCell,cCAConsts.directions.north, ir-1, ic);
				this.pr__link_cell(oCell,cCAConsts.directions.east, ir, ic+1);
				this.pr__link_cell(oCell,cCAConsts.directions.south, ir+1, ic);
				this.pr__link_cell(oCell,cCAConsts.directions.west, ir, ic-1);
				if (piNeighbourType == cCAConsts.neighbours.eightway){
					this.pr__link_cell(oCell,cCAConsts.directions.northeast, ir-1, ic+1);
					this.pr__link_cell(oCell,cCAConsts.directions.southeast, ir+1, ic+1);
					this.pr__link_cell(oCell,cCAConsts.directions.southwest, ir+1, ic-1);
					this.pr__link_cell(oCell,cCAConsts.directions.northwest, ir-1, ic-1);
				}
			}
		cDebug.write("completed cell linking");
	};
	
	//****************************************************************
	this.setCellValue = function(piRow,piCol,pbCreateCell,iValue){
		var oCell = this.getCell(piRow, piCol, pbCreateCell);

		if (iValue !== oCell.value)this.changed_cells.push(oCell);
		oCell.value = iValue;
	}
	
	//****************************************************************
	// use a sparse array for the grid
	// but this causes a problem with neighbours that might not be there
	this.getCell = function(piRow,piCol,pbCreateCell){
		var oPrivates = this.privates;
		var oHash = oPrivates.cell_data;
		
		//get the row
		var oRowMap;
		if (oPrivates.iLastRow == piRow){
			oRowMap = oPrivates.oLastRow;
		}else{
			oRowMap = oHash.get(piRow);
			if (!oRowMap){
				if (!pbCreateCell) return null;
				oRowMap = new Map();
				oHash.set(piRow,oRowMap);
			}
			oPrivates.iLastRow = piRow;
			oPrivates.oLastRow = oRowMap;
		}
		
		//get the column
		var oCell = oRowMap.get(piCol);
		if (! oCell){
			if (!pbCreateCell) return null;
			oCell = new cCACell();
			oCell.data.set(cCAConsts.hash_values.row, piRow);
			oCell.data.set(cCAConsts.hash_values.col, piCol);
			oRowMap.set(piCol, oCell);
		}
		
		return oCell;
	};

	//#######################################################################
	//# privates
	//#######################################################################
	this.pr__link_cell = function(poCell, piNeigh, piRow, piCol){
		var ir, ic;
		ir=piRow;
		if (ir<1) ir= this.rows;
		if (ir>this.rows) ir=1;
		
		ic=piCol;
		if (ic<1) ic= this.cols;
		if (ic>this.cols) ic=1;
		
		var oNeigh = this.getCell(ir,ic,false);
		poCell.setNeighbour(piNeigh,oNeigh);		
	};
	
}