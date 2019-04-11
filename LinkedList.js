// Task: Implement a class named 'RangeList'
// A pair of integers define a range, for example: [1, 5). This range includes integers: 1, 2, 3, and 4.
// A range list is an aggregate of these ranges: [1, 5), [10, 11), [100, 201)

/**
 *  Range List Element
 */
class ListNode {
  /**
   * Create a List Node.
   * @param {Array<number>} data - Array of two integers specifying boundaries
   */
  constructor(data) {
    ;[this.rangeStart, this.rangeEnd] = data
    this.next = null
  }

  /**
   * Traverses Nodes to UnLink element
   * @param {ListNode} element - element to be unlinked
   */
  unlink = element => {
    /* Skip when empty range to delete */
    if (element.rangeEnd - element.rangeStart <= 0) return this

    /* Look for Intersections or Exit */
    if (element.rangeStart > this.rangeEnd) {
      if (this.next) {
        this.next = this.next.unlink(element)
      }

      return this
    }

    if (this._equals(element)) {
      /* when exact match - return next chain of elements */
      return this.next
    } else if (this._contains(element, false)) {
      /* when fully wraps - break into two nodes and return head */
      let leftNode = new ListNode([this.rangeStart, element.rangeStart])
      let rightNode = new ListNode([element.rangeEnd, this.rangeEnd])

      leftNode.next = rightNode

      return leftNode
    } else {
      /* intersections */
      while (this.next && element.rangeEnd > this.next.rangeEnd) {
        this.next = this.next.next
      }

      if (this.next) {
        this.rangeEnd = element.rangeStart
        this.next.rangeStart = element.rangeEnd
      } else {
        this.rangeStart = element.rangeEnd
      }

      return this
    }
  }

  /**
   * Traverses Nodes to Link new Element
   * @param {ListNode} element - element to be linked
   */
  link = element => {
    /* Skip adding when fully contains element */
    if (this._contains(element)) return this

    if (this.rangeStart > element.rangeEnd) {
      /* Element should go into the head */
      element.next = this

      return element
    } else {
      /* Looking for place to add and adding element */
      if (this.rangeEnd < element.rangeStart) {
        this.next = this.next ? this.next.link(element) : element
      } else {
        const combinedData = [...new Set(this.toArray().concat(element.toArray()))];
        [this.rangeStart, this.rangeEnd] = [combinedData[0], combinedData[combinedData.length - 1]]

        this._cleanUp()
      }

      return this
    }
  }

  /**
   * @public
   * Returns Element Array-like
   */
  toArray = () => {
    return Array.from({length: this.rangeEnd - this.rangeStart + 1}, (_, i) => i + this.rangeStart)
  }

  /**
   * @public
   * Prints values in [start, end) format
   */
  toString = () => {
    return `[${this.rangeStart},${this.rangeEnd})`
  }

  /**
   * @private
   * Joining overlapping ranges
   */
  _cleanUp = () => {
    while (this.next && this.rangeEnd >= this.next.rangeStart) {
      this.rangeEnd = this.next.rangeEnd
      this.next = this.next.next
    }
  }

  /**
   * @private
   * Checks if current range contains incoming one
   * @param {ListNode} element element to check for enclosing
   * @param {boolean} incl flag to include beginning or not
   * @returns {boolean} result
   */
  _contains = (element, incl = true) => {
    return incl ?
      this.rangeStart <= element.rangeStart && this.rangeEnd >= element.rangeEnd :
      this.rangeStart < element.rangeStart && this.rangeEnd >= element.rangeEnd
  };

  /**
   * @private
   * Checks if current element equals incoming one
   * @param {ListNode} element element to check for equality
   * @returns {boolean} result
   */
  _equals = element => {
    return this.rangeStart === element.rangeStart && this.rangeEnd === element.rangeEnd
  };

  /* Iterator of List Nodes*/
  [Symbol.iterator] = function* () {
    let current = this //eslint-disable-line
    while (current) {
      yield current
      current = current.next
    }
  }
}

class RangeList {
  constructor() {
    this.head = null
  }

  /**
   * Adds a range to the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  add(range) {
    let newNode = new ListNode(range)
    this.head = !this.head ? newNode : this.head.link(newNode)
  }

  /**
   * Removes a range from the list
   * @param {Array<number>} range - Array of two integers that specify beginning and end of range.
   */
  remove(range) {
    if (!this.head) {return}
    this.head = this.head.unlink(new ListNode(range))
  }

  /**
   * Prints out the list of ranges in the range list
   */
  print() {
    if (!this.head) return console.log('()')
    return console.log([...this.head].map(element => element.toString()).join(' '))
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
// // Should display: [1, 8) [10, 21)

rl.remove([10, 11])
rl.print()
// // Should display: [1, 8) [11, 21)

rl.remove([15, 17])
rl.print()
// // Should display: [1, 8) [11, 15) [17, 21)

rl.remove([3, 19])
rl.print()
// // Should display: [1, 3) [19, 21)
