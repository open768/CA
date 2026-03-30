//* **************************************************************************
// subclasses of cBaseEvent for specific event types - these are the events that will be fired and listened for in the app
//* **************************************************************************
class cCAActionEvent extends cBaseEvent {
  static actions = {
    ready: 'AR',
    grid_init: 'AGI',
    control: 'AC',
    force_grid_redraw: 'AFGR'
  }

  static notify = {
    import_grid: 'AING'
  }

  static control_actions = {
    play: 'CAP',
    stop: 'CAS1',
    step: 'CAS2'
  }
}

//* **************************************************************************

class cCARuleEvent extends cBaseEvent {
  static actions = {
    update_rule: 'AU',
    set_rule: 'ASR',
    status: 'AST'
  }
}

// ###############################################################################

class cCAGridEvent extends cBaseEvent {
  static actions = {
    init_grid: 'AI',
    set_cell: 'ASC',
    get_grid: 'AGG'
  }

  static notify = {
    clear: 'NC',
    done: 'ND',
    changedCellsConsumed: 'NCCC',
    allConsumersDone: 'NACD',
    nochange: 'NNC',
    repeatPattern: 'NRP',
    grid: 'NGD'
  }

  static done = {
    cells_consumed: 'DCC'
  }
}

class cCACanvasEvent extends cBaseEvent {
  static actions = {
    grid_status: 'AG',
    set_grid: 'ASG',
    import: 'AI'
  }
}
