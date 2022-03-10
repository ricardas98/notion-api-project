const dotenv = require("dotenv")
dotenv.config();
const {Client} = require("@notionhq/client");

const notion = new Client({auth: process.env.NOTION_API_TOKEN})

interface Block {

}

class BlockItem implements Block{
     readonly type: string
     readonly value: string

    constructor(type: string, value: string) {
        this.type = type;
        this.value = value
    }
}

class CompoundBlock implements Block{
     readonly type: string;
     readonly blocks: Block[];

    constructor(type: string) {
        this.type = type;
        this.blocks = [];
    }

    addBlock(block: Block){
        this.blocks.splice(this.blocks.length, 0, block);
    }
}

enum BlockTypes {
    HEADING_1 = "heading_1",
    PARAGRAPH = "paragraph",
    COLUMN_LIST = "column_list",
    COLUMN = "column",
}

function parseCompoundBlock(type: string, data: []): CompoundBlock{
    const compoundblock = new CompoundBlock(type);
    data.forEach((block: any) => {
        //console.log(block);
        switch (block.type) {
            case BlockTypes.HEADING_1:
                console.log(block.heading_1.rich_text[0].plain_text);
                const heading_1 = block.heading_1.rich_text[0].plain_text;
                compoundblock.addBlock(new BlockItem(BlockTypes.HEADING_1, heading_1))
                break;
            case BlockTypes.PARAGRAPH:
                console.log(block.paragraph.rich_text[0].plain_text);
                const paragraph = block.paragraph.rich_text[0].plain_text;
                compoundblock.addBlock(new BlockItem(BlockTypes.HEADING_1, paragraph))
                break;
            case BlockTypes.COLUMN_LIST:
                compoundblock.addBlock(getContainerContent(block.id));
                break;
            case BlockTypes.COLUMN:
                compoundblock.addBlock(getContainerContent(block.id));
                break;
            default:
                console.log("not parsed");
                break;
        }
    })
    return compoundblock;
}


function fetchContainerContent(blockId: string) {
    return notion.blocks.children.list({
        block_id: blockId,
        page_size: "50",
    })
}

const getContainerContent = async (id: string) => {
    return await fetchContainerContent(id).then((res: any) =>  parseCompoundBlock(res.object, res.results));
}

function printRespose(res: any) {
    setTimeout(() => console.log(JSON.stringify(res)), 10000)
}

getContainerContent(process.env.NOTION_PAGE_ID as string).then((res) => printRespose(res));