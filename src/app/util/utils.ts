import { Task } from '../../api/backend';
import { environment } from '../../environments/environment';

type RecursiveArray<T> = Array<T | RecursiveArray<T>>;

export class Utils {
  /**
   * Creates a substring of a HTML by putting it into a div element and then substringing .innerText
   * @param html html to substring
   * @param start where to start
   * @param length how many characters to keep
   * @private
   */
  public static substrHTML(html: string, start: number, length?: number): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText.substr(start, length);
  }

  /**
   * Resolves legacy address into new assets format
   * @param url possilby legacy url
   * @private
   */
  public static parseLegacyAssetsUrl(url: string): string {
    return url.startsWith('img/') ? `assets/${url}` : url;
  }

  /**
   * Finds an element inside a multidimensional array
   * @param array multidimensional array to search into
   * @param element element to locate
   * @return true if the element is contained inside the multidimensional array
   */
  public static deepContains<T>(array: RecursiveArray<T>, element: T): boolean {
    for (const x of array) {
      if ((Array.isArray(x) && Utils.deepContains(x, element)) || (element === x)) {
        return true;
      }
    }
    return false;
  }

  public static flatArray<T>(array: RecursiveArray<T>): T[] {
    if ('flat' in Array.prototype) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return array.flat(999) as T[];
    }

    const r: T[] = [];
    array.forEach((x) => {
      if (Array.isArray(x)) {
        r.push(...Utils.flatArray(x));
      } else {
        r.push(x);
      }
    });

    return r;
  }

  public static getTaskIconURL(task: Task): string {
    return Utils.fixUrl(`${environment.backend}${task.picture_base}/${task.state}${task.picture_suffix}`);
  }

  public static fixUrl(url: string): string {
    const replace = (x: string): string => x.replace(/([^:])\/\//g, '$1/');
    return replace(replace(url));
  }

  public static hideButton(button: HTMLButtonElement, showAfter?: number): void {
    button.disabled = true;
    const origOpacity = button.style.opacity;
    const origTransition = button.style.transition;
    button.style.transition = 'opacity 0.3s';
    button.style.opacity = '0';

    if (showAfter) {
      setTimeout(() => {
        button.disabled = false;
        button.style.opacity = origOpacity;
        setTimeout(() =>  button.style.transition = origTransition, 300);
      }, showAfter);
    }
  }
}
