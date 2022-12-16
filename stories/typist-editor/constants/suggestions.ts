import { shuffle } from 'lodash-es'

type HashtagSuggestionItem = {
    id: number
    name: string
}

const HASHTAG_SUGGESTION_ITEMS: HashtagSuggestionItem[] = shuffle([
    { id: 2268429318, name: 'amazing' },
    { id: 9426970746, name: 'art' },
    { id: 7206271383, name: 'autumn' },
    { id: 9608208920, name: 'baby' },
    { id: 2629107620, name: 'beach' },
    { id: 1464663628, name: 'cat' },
    { id: 9960428966, name: 'christmas' },
    { id: 8786604996, name: 'design' },
    { id: 6489947838, name: 'dog' },
    { id: 3317631570, name: 'drawing' },
    { id: 1816272779, name: 'family' },
    { id: 9372622184, name: 'fashion' },
    { id: 7785014922, name: 'fitness' },
    { id: 1034173723, name: 'flowers' },
    { id: 3602435326, name: 'food' },
    { id: 3833335807, name: 'foodporn' },
    { id: 6197692902, name: 'friends' },
    { id: 5171729832, name: 'fun' },
    { id: 5866373947, name: 'funny' },
    { id: 1104873176, name: 'gym' },
    { id: 5012063244, name: 'handmade' },
    { id: 2277368032, name: 'happy' },
    { id: 2446132847, name: 'healthy' },
    { id: 8684491157, name: 'holiday' },
    { id: 5224353114, name: 'home' },
    { id: 5950856872, name: 'inspiration' },
    { id: 7282953724, name: 'landscape' },
    { id: 7248024783, name: 'lifestyle' },
    { id: 7436799371, name: 'lol' },
    { id: 8856418266, name: 'love' },
    { id: 7232940297, name: 'makeup' },
    { id: 6148445433, name: 'memes' },
    { id: 5605762249, name: 'motivation' },
    { id: 9343576366, name: 'music' },
    { id: 1304072177, name: 'nature' },
    { id: 8255869247, name: 'party' },
    { id: 9435479677, name: 'photography' },
    { id: 9670152372, name: 'pretty' },
    { id: 8292315632, name: 'sea' },
    { id: 6966893897, name: 'selfie' },
    { id: 7578218204, name: 'sky' },
    { id: 3391843206, name: 'spring' },
    { id: 1303720752, name: 'style' },
    { id: 8432606971, name: 'summer' },
    { id: 5316920015, name: 'sunset' },
    { id: 9967811854, name: 'travel' },
    { id: 5775389005, name: 'wedding' },
    { id: 8116531212, name: 'winter' },
    { id: 5201558984, name: 'workout' },
    { id: 7625628140, name: 'yummy' },
])

type MentionSuggestionItem = {
    uid: string
    name: string
}

const MENTION_SUGGESTION_ITEMS: MentionSuggestionItem[] = shuffle([
    { uid: '8218877932', name: 'Al Pacino' },
    { uid: '2376248434', name: 'Alan Rickman' },
    { uid: '7582311426', name: 'Amy Adams' },
    { uid: '5441252154', name: 'Anne Bancroft' },
    { uid: '8140398438', name: 'Anne Hathaway' },
    { uid: '3777716804', name: 'Anthony Hopkins' },
    { uid: '4478885052', name: 'Audrey Hepburn' },
    { uid: '3100863011', name: 'Barbara Stanwyck' },
    { uid: '8874179979', name: 'Benedict Cumberbatch' },
    { uid: '9000940982', name: 'Bette Davis' },
    { uid: '4759170383', name: 'Brad Pitt' },
    { uid: '5956789123', name: 'Cate Blanchett' },
    { uid: '8470497758', name: 'Charlize Theron' },
    { uid: '2860927956', name: 'Christian Bale' },
    { uid: '4457661309', name: 'Christopher Walken' },
    { uid: '7343443712', name: 'Clint Eastwood' },
    { uid: '2465030183', name: 'Daniel Day-Lewis' },
    { uid: '5614659455', name: 'Denzel Washington' },
    { uid: '7659120581', name: 'Diane Keaton' },
    { uid: '6222459463', name: 'Ed Harris' },
    { uid: '6730011157', name: 'Edward Norton' },
    { uid: '2019696630', name: 'Elizabeth Taylor' },
    { uid: '6191245793', name: 'Emily Blunt' },
    { uid: '6865092325', name: 'Emma Stone' },
    { uid: '5064838948', name: 'Emma Thompson' },
    { uid: '6192534926', name: 'Frances McDormand' },
    { uid: '4473889068', name: 'Gary Oldman' },
    { uid: '1225854407', name: 'Gary Sinise' },
    { uid: '4595551363', name: 'Glenn Close' },
    { uid: '2408231736', name: 'Grace Kelly' },
    { uid: '8304547201', name: 'Harrison Ford' },
    { uid: '1244620246', name: 'Heath Ledger' },
    { uid: '5661480326', name: 'Helen Mirren' },
    { uid: '7569742737', name: 'Helena Bonham Carter' },
    { uid: '3421423628', name: 'Hugh Jackman' },
    { uid: '2758495686', name: 'Ian McKellen' },
    { uid: '7492110081', name: 'Ingrid Bergman' },
    { uid: '1838559507', name: 'Jack Nicholson' },
    { uid: '2418976696', name: 'James Earl Jones' },
    { uid: '4637367751', name: 'James Stewart' },
    { uid: '8122384676', name: 'Jamie Lee Curtis' },
    { uid: '1582145121', name: 'Jeff Bridges' },
    { uid: '3826097343', name: 'Jessica Lange' },
    { uid: '1899996303', name: 'Joaquin Phoenix' },
    { uid: '8213809556', name: 'Jodie Foster' },
    { uid: '2769654314', name: 'John Malkovich' },
    { uid: '3973945098', name: 'Johnny Depp' },
    { uid: '6486781572', name: 'Judi Dench' },
    { uid: '5190636267', name: 'Judy Garland' },
    { uid: '7615641462', name: 'Julia Roberts' },
    { uid: '8247258609', name: 'Julianne Moore' },
    { uid: '5312890529', name: 'Julie Andrews' },
    { uid: '6912657435', name: 'Kate Winslet' },
    { uid: '3010776063', name: 'Katherine Hepburn' },
    { uid: '3207878474', name: 'Kathy Bates' },
    { uid: '9871381263', name: 'Keanu Reeves' },
    { uid: '6386622812', name: 'Kurt Russell' },
    { uid: '3421420327', name: 'Lauren Bacall' },
    { uid: '2300368234', name: 'Leonardo DiCaprio' },
    { uid: '9618430022', name: 'Liam Neeson' },
    { uid: '1178907031', name: 'Lucille Ball' },
    { uid: '1811477526', name: 'Maggie Smith' },
    { uid: '8689785604', name: 'Margot Robbie' },
    { uid: '6392738649', name: 'Marilyn Monroe' },
    { uid: '7839597351', name: 'Marlon Brando' },
    { uid: '9817442942', name: 'Matt Damon' },
    { uid: '6949006047', name: 'Matthew McConaughey' },
    { uid: '2153090253', name: "Maureen O'Hara" },
    { uid: '1337198757', name: 'Meryl Streep' },
    { uid: '3629953174', name: 'Michael Caine' },
    { uid: '7091971426', name: 'Michael Keaton' },
    { uid: '6885375349', name: 'Michelle Pfeiffer' },
    { uid: '5972052865', name: 'Morgan Freeman' },
    { uid: '2690675889', name: 'Natalie Portman' },
    { uid: '2788414803', name: 'Natalie Wood' },
    { uid: '8884477514', name: 'Nicole Kidman' },
    { uid: '5284776100', name: 'Olivia de Havilland' },
    { uid: '6528954143', name: 'Patrick Stewart' },
    { uid: '3637504189', name: 'Paul Newman' },
    { uid: '4106668076', name: 'Rita Hayworth' },
    { uid: '4782151713', name: 'Robert De Niro' },
    { uid: '6023459994', name: 'Robert Downey Jr.' },
    { uid: '7249698311', name: 'Robert Duvall' },
    { uid: '7421532064', name: 'Robin Williams' },
    { uid: '9329767532', name: 'Russell Crowe' },
    { uid: '8909819154', name: 'Sally Field' },
    { uid: '5068389870', name: 'Sam Elliott' },
    { uid: '4103461020', name: 'Samuel L. Jackson' },
    { uid: '2500654397', name: 'Sandra Bullock' },
    { uid: '9306639155', name: 'Scarlett Johansson' },
    { uid: '3051881376', name: 'Sean Connery' },
    { uid: '2694624022', name: 'Sigourney Weaver' },
    { uid: '2434031862', name: 'Steve Buscemi' },
    { uid: '8290874650', name: 'Susan Sarandon' },
    { uid: '6728264612', name: 'Tom Hanks' },
    { uid: '7631497125', name: 'Tom Hardy' },
    { uid: '8488152868', name: 'Tommy Lee Jones' },
    { uid: '9072641833', name: 'Viola Davis' },
    { uid: '6419632986', name: 'Vivien Leigh' },
    { uid: '6606640946', name: 'Willem Dafoe' },
])

/**
 * Workaround for the current typing incompatibility between Tippy.js and Tiptap Suggestion utility.
 *
 * @see https://github.com/ueberdosis/tiptap/issues/2795#issuecomment-1160623792
 */
const DOM_RECT_FALLBACK: DOMRect = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {
        return {}
    },
}

export { DOM_RECT_FALLBACK, HASHTAG_SUGGESTION_ITEMS, MENTION_SUGGESTION_ITEMS }

export type { HashtagSuggestionItem, MentionSuggestionItem }
