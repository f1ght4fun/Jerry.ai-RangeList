// Task: Implement a class named 'RangeList'
// A pair of integers define a range, for example: [1, 5). This range includes integers: 1, 2, 3, and 4.
// A range list is an aggregate of these ranges: [1, 5), [10, 11), [100, 201)

/**
 *  Range List Element
 */
class RangeElement {
  /**
   * Create a List Node.
   * @param {Array<number>} data - Array of two integers specifying boundaries
   */
  constructor(data) {
    ;[this.rangeStart, this.rangeEnd] = data
  }

  /**
   * @public
   * Prints values in [start, end) format
   */
  toString = () => {
    return `[${this.rangeStart},${this.rangeEnd})`
  }

  /**
  * @public
  * Checks if current range contains incoming one
  * @param {ListNode} element element to check for enclosing
  * @param {boolean} incl flag to include beginning or not
  * @returns {boolean} result
  */
  wraps = (element, incl = true) => {
    return incl ?
      this.rangeStart <= element.rangeStart && this.rangeEnd >= element.rangeEnd :
      this.rangeStart < element.rangeStart && this.rangeEnd >= element.rangeEnd
  };

  /**
 * @public
 * Checks if value is within element range
 * @param {integer} value to check if within range
 * @returns {boolean} result
 */
  rangeContains = (value) => {
    return this.rangeStart <= value && this.rangeEnd >= value
  };
}

class RangeList {
  constructor() {
    this.rangeCollection = []
  }

  /**
   * Adds a range to the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  add(range) {
    let element = new RangeElement(range)
    if (element.rangeStart === element.rangeEnd) {return}

    if (!this.rangeCollection.length) {
      this.rangeCollection.push(element)
    } else {

      const position = this._positionByRangeStartAt(element)

      this._upsertAt(position, element)

      if (position) {
        this._cleanUp(position)
      }
    }
  }

  /**
   * Removes a range from the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  remove(range) {
    if (!this.rangeCollection.length) {return}

    let element = new RangeElement(range)
    if (element.rangeStart === element.rangeEnd) {return}

    let positionFrom = this._positionByRangeStartAt(element)
    // if (positionFrom !== 0) {
    // positionFrom--
    // }
    let positionTo = this._positionByRangeEndAt(element)

    this._deleteAt(positionFrom, positionTo, element)
  }

  /**
   * Prints out the list of ranges in the range list
   */
  print() {
    if (!this.rangeCollection.length) return console.log('()')
    return console.log(this.rangeCollection.map(element => element.toString()).join(' '))
  }

  /**
   * @private
   * Joining overlapping ranges
   */
  _cleanUp = (position) => {
    let cleanupPosition = position - 1 < 0 ? 0 : position - 1

    while (
      this.rangeCollection[cleanupPosition + 1] &&
      this.rangeCollection[cleanupPosition].rangeEnd >= this.rangeCollection[cleanupPosition + 1].rangeStart
    ) {
      if (this.rangeCollection[cleanupPosition].rangeEnd < this.rangeCollection[cleanupPosition + 1].rangeEnd) {
        this.rangeCollection[cleanupPosition].rangeEnd = this.rangeCollection[cleanupPosition + 1].rangeEnd
      }

      this.rangeCollection.splice(cleanupPosition + 1, 1)
    }
  }

  /**
  * @private
  * @param {RangeElement} element - Search parameter
  * Searching position by range start where it is bigger than one in array
  */
  _positionByRangeStartAt = (element) => {
    let left = 0
    let right = this.rangeCollection.length
    let position = 0

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2)
      if (!this.rangeCollection[mid]) {return mid}

      if (element.rangeStart === this.rangeCollection[mid].rangeStart) {
        return mid
      }

      if (this.rangeCollection[mid].rangeStart > element.rangeStart) {
        right = mid - 1
      } else {
        left = mid + 1
        position = left
      }
    }

    return position
  }

  /**
  * @private
  * @param {RangeElement} element - Search parameter
  * Searching position by range end where it is smaller than one in array
  */
  _positionByRangeEndAt = (element) => {
    let left = 0
    let right = this.rangeCollection.length
    let position = 0

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2)
      if (!this.rangeCollection[mid]) {return mid}

      if (element.rangeEnd === this.rangeCollection[mid].rangeEnd) {
        return mid
      }

      if (this.rangeCollection[mid].rangeEnd > element.rangeEnd) {
        right = mid - 1
      } else {
        left = mid + 1
        position = left
      }
    }

    return position
  }

  /**
  * @private
  * Inserting New or Updating Existing Collection Element
  */
  _upsertAt = (position, element) => {
    const collectionElement = this.rangeCollection[position]
    if (collectionElement) {
      /* If element found totally encloses new range - no need to do anything */
      if (collectionElement.wraps(element)) {return}

      /* If start of range of two elements is same we select biggest for the element found */
      if (collectionElement && element.rangeStart === collectionElement.rangeStart) {
        collectionElement.rangeEnd = collectionElement.rangeEnd > element.rangeEnd ? collectionElement.rangeEnd : element.rangeEnd
        return
      }
    }

    this.rangeCollection.splice(position, 0, element)
  }

  /**
  * @private
  * Deleting or Adjusting Existing Collection Elements
  */
  _deleteAt = (from, to, element) => {
    const toElement = this.rangeCollection[to]
    const fromElement = this.rangeCollection[from - 1]

    if (toElement) {
      /* If element found by range end wraps range to delete - destruct range into two */
      if (toElement.wraps(element, false)) {
        this.rangeCollection.splice(to + 1, 0, new RangeElement([element.rangeEnd, toElement.rangeEnd]))
        toElement.rangeEnd = element.rangeStart
        return
      }

      /* Move range starting to elements ending removing destroyed pieces */
      if (toElement.rangeEnd !== element.rangeEnd) {
        toElement.rangeStart = element.rangeEnd
        to--
      }
    }

    /* Element found by start we adjust by moving range ending to new element range starting */
    if (fromElement && fromElement.rangeStart !== element.rangeStart) {
      if (fromElement.rangeContains(element.rangeStart)) {
        fromElement.rangeEnd = element.rangeStart

      }
    }

    /* If elements range includes full ranges - removing them */
    this.rangeCollection.splice(from, to - from + 1)
  }
}

// Example run
const rl = new RangeList()

rl.add([1, 5])
rl.print()
// Should display: [1, 5)

rl.add([10, 20])
rl.print()
// Should display: [1, 5) [10, 20)

rl.add([20, 20])
rl.print()
// Should display: [1, 5) [10, 20)

rl.add([20, 21])
rl.print()
// Should display: [1, 5) [10, 21)

rl.add([2, 4])
rl.print()
// Should display: [1, 5) [10, 21)

rl.add([3, 8])
rl.print()
// Should display: [1, 8) [10, 21)

rl.remove([10, 10])
rl.print()
// Should display: [1, 8) [10, 21)

rl.remove([10, 11])
rl.print()
// Should display: [1, 8) [11, 21)

rl.remove([15, 17])
rl.print()
// Should display: [1, 8) [11, 15) [17, 21)

rl.remove([3, 19])
rl.print()
// Should display: [1, 3) [19, 21)

rl.remove([1, 29])
rl.print()
// Should display: ()
