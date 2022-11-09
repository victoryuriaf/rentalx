import fs from "fs";
import { parse as csvParse } from "csv-parse";
import { inject, injectable } from "tsyringe";
import { ICategoriesRepository } from "@modules/cars/repositories/ICategoriesRepository";

interface IImportCategory {
    name: string;
    description: string;
};

@injectable()
class ImportCategoryUseCase {
    constructor(
        @inject("CategoriesRepository")
        private categoriesRespository: ICategoriesRepository) { };

    loadCategories(file: Express.Multer.File): Promise<IImportCategory[]> {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(file.path);

            const categories: IImportCategory[] = [];

            const parseFile = csvParse();

            stream.pipe(parseFile);

            parseFile
                .on("data", async (line) => {
                    const [name, description] = line;
                    categories.push({
                        name,
                        description,
                    });
                })
                .on("end", () => {
                    fs.promises.unlink(file.path);
                    resolve(categories);
                })
                .on("error", (err) => {
                    reject(err);
                });
        });
    }

    async execute(file: Express.Multer.File): Promise<void> {
        const categories = await this.loadCategories(file);

        categories.map( async (category) => {
            const {name, description} = category;

            const existCategory = await this.categoriesRespository.findByName(name);

            if (!existCategory) {
                await this.categoriesRespository.create({
                    name,
                    description,
                });
            };
        });
    }
}

export { ImportCategoryUseCase };

function on(arg0: string, arg1: () => void) {
    throw new Error("Function not implemented.");
}
